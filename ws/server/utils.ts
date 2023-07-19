import * as Y from "yjs";
import * as syncProtocol from "y-protocols/sync.js";

import * as lib0 from "lib0";
import debounce from "lodash.debounce";
import { callbackHandler, isCallbackSet } from "./callback";
import { WebSocket } from "ws";
import { IncomingMessage } from "http";
import {
	CustomAwareness,
	applyAwarenessUpdate,
	encodeAwarenessUpdate,
	removeAwarenessStates,
} from "../../common/yjs/custom_awareness";
import { getUsername } from "./usernames";

const encoding = lib0.encoding;
const decoding = lib0.decoding;
const map = lib0.map;

const CALLBACK_DEBOUNCE_WAIT = process.env.CALLBACK_DEBOUNCE_WAIT
	? parseInt(process.env.CALLBACK_DEBOUNCE_WAIT)
	: 2000;
const CALLBACK_DEBOUNCE_MAXWAIT = process.env.CALLBACK_DEBOUNCE_MAXWAIT
	? parseInt(process.env.CALLBACK_DEBOUNCE_MAXWAIT)
	: 10000;

const wsReadyStateConnecting = 0;
const wsReadyStateOpen = 1;
const wsReadyStateClosing = 2; // eslint-disable-line
const wsReadyStateClosed = 3; // eslint-disable-line

// disable gc when using snapshots!
const gcEnabled = process.env.GC !== "false" && process.env.GC !== "0";

/**
 * @type {Map<string,WSSharedDoc>}
 */
export const docs = new Map<string, WSSharedDoc>();

const messageSync = 0;
const messageAwareness = 1;
// const messageAuth = 2

const updateHandler = (update: Uint8Array, origin: any, doc: WSSharedDoc) => {
	const encoder = encoding.createEncoder();
	encoding.writeVarUint(encoder, messageSync);
	syncProtocol.writeUpdate(encoder, update);
	const message = encoding.toUint8Array(encoder);
	doc.conns.forEach((_, conn) => send(doc, conn, message));
};

export class WSSharedDoc extends Y.Doc {
	/**
	 * Maps from conn to set of controlled user ids. Delete all user ids from awareness when this conn is closed
	 */
	conns: Map<WebSocket, Set<number>>;
	names: Record<number, string>;
	name: string;
	awareness: CustomAwareness;
	constructor(name: string) {
		super({ gc: gcEnabled });
		this.name = name;

		this.conns = new Map();
		this.names = {};
		this.awareness = new CustomAwareness(this);
		this.awareness.setLocalState(null);

		const awarenessChangeHandler = (
			{
				added,
				updated,
				removed,
			}: {
				added: Array<number>;
				updated: Array<number>;
				removed: Array<number>;
			},
			conn: WebSocket | null
		) => {
			const changedClients = added.concat(updated, removed);
			if (conn !== null) {
				const connControlledIDs = this.conns.get(conn);
				if (connControlledIDs !== undefined) {
					added.forEach((clientID) => {
						connControlledIDs.add(clientID);
					});
					removed.forEach((clientID) => {
						connControlledIDs.delete(clientID);
					});
				}
			}
			const awarenessStates = this.awareness.getStates();

			for (const [key, value] of awarenessStates) {
				let name = this.names[key];
				if (!name) {
					this.names[key] = getUsername(Object.values(this.names));
					name = this.names[key];
				}

				value["user"] = {
					name: this.names[key],
					color: "#ff0000",
				};
			}

			// broadcast awareness update
			const encoder = encoding.createEncoder();
			encoding.writeVarUint(encoder, messageAwareness);
			encoding.writeVarUint8Array(
				encoder,
				encodeAwarenessUpdate(this.awareness, changedClients)
			);
			const buff = encoding.toUint8Array(encoder);

			this.conns.forEach((_, c) => {
				send(this, c, buff);
			});
		};
		this.awareness.on("update", awarenessChangeHandler);
		this.on("update", updateHandler);
		if (isCallbackSet) {
			this.on(
				"update",
				debounce(callbackHandler, CALLBACK_DEBOUNCE_WAIT, {
					maxWait: CALLBACK_DEBOUNCE_MAXWAIT,
				})
			);
		}
	}
}

/**
 * Gets a Y.Doc by name, whether in memory or on disk
 *
 * @param docname - the name of the Y.Doc to find or create
 * @param gc - whether to allow gc on the doc (applies only when created)
 */
export const getYDoc = (docname: string, gc: boolean = true): WSSharedDoc =>
	map.setIfUndefined(docs, docname, () => {
		const doc = new WSSharedDoc(docname);
		doc.gc = gc;
		docs.set(docname, doc);
		return doc;
	});

const messageListener = (
	conn: WebSocket,
	doc: WSSharedDoc,
	message: Uint8Array
) => {
	try {
		const encoder = encoding.createEncoder();
		const decoder = decoding.createDecoder(message);
		const messageType = decoding.readVarUint(decoder);
		switch (messageType) {
			case messageSync:
				encoding.writeVarUint(encoder, messageSync);
				syncProtocol.readSyncMessage(decoder, encoder, doc, conn);

				// If the `encoder` only contains the type of reply message and no
				// message, there is no need to send the message. When `encoder` only
				// contains the type of reply, its length is 1.
				if (encoding.length(encoder) > 1) {
					send(doc, conn, encoding.toUint8Array(encoder));
				}
				break;
			case messageAwareness: {
				applyAwarenessUpdate(
					doc.awareness,
					decoding.readVarUint8Array(decoder),
					conn
				);
				break;
			}
		}
	} catch (err) {
		console.error(err);
		doc.emit("error", [err]);
	}
};

const closeConn = (doc: WSSharedDoc, conn: WebSocket) => {
	if (doc.conns.has(conn)) {
		const controlledIds = doc.conns.get(conn);

		if (!controlledIds) {
			throw new Error("No controlled IDs found");
		}

		doc.conns.delete(conn);
		removeAwarenessStates(doc.awareness, Array.from(controlledIds), null);
	}
	conn.close();
};

const send = (doc: WSSharedDoc, conn: WebSocket, m: Uint8Array) => {
	if (
		conn.readyState !== wsReadyStateConnecting &&
		conn.readyState !== wsReadyStateOpen
	) {
		closeConn(doc, conn);
	}
	try {
		conn.send(m, (err: any) => {
			err != null && closeConn(doc, conn);
		});
	} catch (e) {
		closeConn(doc, conn);
	}
};

const pingTimeout = 5000;

export const setupWSConnection = (
	conn: WebSocket,
	req: IncomingMessage,
	{ docName = req.url?.slice(1).split("?")[0], gc = true }: any = {}
) => {
	console.log("setting up WS connection");

	conn.binaryType = "arraybuffer";
	// get doc, initialize if it does not exist yet
	const doc = getYDoc(docName, gc);
	doc.conns.set(conn, new Set());
	// listen and reply to events
	conn.on("message", (message: ArrayBuffer) =>
		messageListener(conn, doc, new Uint8Array(message))
	);

	// Check if connection is still alive
	let pongReceived = true;
	const pingInterval = setInterval(() => {
		if (!pongReceived) {
			if (doc.conns.has(conn)) {
				closeConn(doc, conn);
			}
			clearInterval(pingInterval);
		} else if (doc.conns.has(conn)) {
			pongReceived = false;
			try {
				conn.ping();
			} catch (e) {
				closeConn(doc, conn);
				clearInterval(pingInterval);
			}
		}
	}, pingTimeout);
	conn.on("close", () => {
		closeConn(doc, conn);
		clearInterval(pingInterval);
	});
	conn.on("pong", () => {
		pongReceived = true;
	});
	// put the following in a variables in a block so the interval handlers don't keep in in
	// scope
	{
		// send sync step 1
		const encoder = encoding.createEncoder();
		encoding.writeVarUint(encoder, messageSync);
		syncProtocol.writeSyncStep1(encoder, doc);
		send(doc, conn, encoding.toUint8Array(encoder));
		const awarenessStates = doc.awareness.getStates();

		if (awarenessStates.size > 0) {
			const encoder = encoding.createEncoder();
			encoding.writeVarUint(encoder, messageAwareness);
			encoding.writeVarUint8Array(
				encoder,
				encodeAwarenessUpdate(
					doc.awareness,
					Array.from(awarenessStates.keys())
				)
			);

			send(doc, conn, encoding.toUint8Array(encoder));
		}
	}
};
