import * as syncProtocol from "y-protocols/sync";
import * as Y from "yjs";

import * as lib0 from "lib0";
import debounce from "lodash.debounce";
import SuperJSON from "superjson";
import { WebSocket } from "ws";
import { applyUpdateV2 } from "yjs";

import { Logger, YJS, WSTypes } from "@notecraft/common";
import { callbackHandler, isCallbackSet } from "./callback.js";
import { WsRedisType } from "./index.js";
import { getUsername } from "./usernames.js";

const hexColors = [
	"#D48C8C",
	"#49453E",
	"#D6D2B5",
	"#C4BC84",
	"#93AE88",
	"#767A8A",
	"#A1B9C5",
	"#776F5F",
	"#6D8165",
	"#51604B",
];

const encoding = lib0.encoding;
const decoding = lib0.decoding;

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
const _gcEnabled = process.env.GC !== "false" && process.env.GC !== "0";

export const docs = new Map<string, WSSharedDoc>();

const messageSync = 0;
const messageAwareness = 1;
// const messageAuth = 2

export const saveDoc = debounce(
	(doc: WSSharedDoc, userId: string) => {
		doc.redis.rpc(
			"App",
			"SaveDoc",
			{
				slug: doc.name,
				userId: userId,
				content: Array.from(YJS.encodeYDocContent(doc)),
			},
			{
				ignoreResponse: true,
			}
		);
	},
	1000,
	{ maxWait: 5000 }
);

export class WSSharedDoc extends Y.Doc {
	/**
	 * Maps from conn to set of controlled client ids. Delete all client ids from awareness when this conn is closed
	 */
	// conns: Map<WebSocket, Set<number>>;
	conns: Map<WebSocket, { userId: string; clientInfo: WSTypes.UserPresence }>;
	allowEveryoneToEdit: boolean;
	creatorId: string;

	redis: WsRedisType;

	name: string;
	awareness: YJS.CustomAwareness;
	constructor(
		redis: WsRedisType,
		name: string,
		initialContent: number[],
		allowEveryoneToEdit: boolean,
		creatorId: string
	) {
		super({ gc: true });
		this.redis = redis;
		this.name = name;

		this.allowEveryoneToEdit = allowEveryoneToEdit;
		this.creatorId = creatorId;

		this.conns = new Map();
		this.awareness = new YJS.CustomAwareness(this);
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
			const addId = added[0];
			// const updatedId = added[0];
			const removedId = removed[0];

			const changedClients = added.concat(updated, removed);
			if (conn !== null) {
				const connDescriptor = this.conns.get(conn);

				if (!connDescriptor) {
					Logger.warn("No conn descriptor found!");
					return;
				}

				if (addId) {
					connDescriptor.clientInfo.clientId = addId;
				}

				if (
					removedId &&
					removedId === connDescriptor.clientInfo.clientId
				) {
					connDescriptor.clientInfo.clientId = undefined;
				}

				if (addId || removedId) {
					this.broadcastPresenceUpdate();
				}
			}
			// broadcast awareness update
			const encoder = encoding.createEncoder();
			encoding.writeVarUint(encoder, messageAwareness);
			encoding.writeVarUint8Array(
				encoder,
				YJS.encodeAwarenessUpdate(this.awareness, changedClients)
			);
			const buff = encoding.toUint8Array(encoder);

			this.conns.forEach((_, c) => {
				this.send(c, buff);
			});
		};

		this.awareness.on("update", awarenessChangeHandler);
		this.on("update", this.updateHandler);
		if (isCallbackSet) {
			this.on(
				"update",
				debounce(callbackHandler, CALLBACK_DEBOUNCE_WAIT, {
					maxWait: CALLBACK_DEBOUNCE_MAXWAIT,
				})
			);
		}

		applyUpdateV2(this, Buffer.from(initialContent));
	}

	get connCount() {
		return this.conns.size;
	}

	updateHandler = (update: Uint8Array, origin: WebSocket) => {
		const isFromServer = origin === null;
		const user = this.conns.get(origin);

		if (!isFromServer) {
			if (!user) {
				Logger.warn("No user found in updateHandler");
				return;
			}

			const canEdit =
				this.allowEveryoneToEdit || user.userId === this.creatorId;

			if (!canEdit) {
				Logger.warn("Edit attempt by user who can not edit");
				return;
			}
		}

		const encoder = encoding.createEncoder();
		encoding.writeVarUint(encoder, messageSync);
		syncProtocol.writeUpdate(encoder, update);
		const message = encoding.toUint8Array(encoder);

		if (!isFromServer && user) {
			saveDoc(this, user.userId);
		}

		this.conns.forEach((_, conn) => this.send(conn, message));
	};

	broadcastPresenceUpdate() {
		this.broadcastAll({
			type: "presencesUpdated",
			users: [...this.conns.values()].map((val) => val.clientInfo),
		});
	}

	messageListener = (conn: WebSocket, message: Uint8Array) => {
		try {
			const encoder = encoding.createEncoder();
			const decoder = decoding.createDecoder(message);
			const messageType = decoding.readVarUint(decoder);
			switch (messageType) {
				case messageSync:
					encoding.writeVarUint(encoder, messageSync);
					syncProtocol.readSyncMessage(decoder, encoder, this, conn);

					// If the `encoder` only contains the type of reply message and no
					// message, there is no need to send the message. When `encoder` only
					// contains the type of reply, its length is 1.
					if (encoding.length(encoder) > 1) {
						this.send(conn, encoding.toUint8Array(encoder));
					}
					break;
				case messageAwareness: {
					YJS.applyAwarenessUpdate(
						this.awareness,
						decoding.readVarUint8Array(decoder),
						conn
					);
					break;
				}
			}
		} catch (err) {
			console.error(err);
			this.emit("error", [err]);
		}
	};

	addConnection(conn: WebSocket, userId: string) {
		this.conns.set(conn, {
			userId,
			clientInfo: {
				name: getUsername(
					[...this.conns.values()].map((val) => val.clientInfo.name)
				),
				color: hexColors[this.connCount % hexColors.length],
				clientId: undefined,
			},
		});

		conn.on("message", (message: ArrayBuffer) =>
			this.messageListener(conn, new Uint8Array(message))
		);

		// Check if connection is still alive
		let pongReceived = true;
		const pingInterval = setInterval(() => {
			if (!pongReceived) {
				if (this.conns.has(conn)) {
					this.closeConn(conn);
				}
				clearInterval(pingInterval);
			} else if (this.conns.has(conn)) {
				pongReceived = false;
				try {
					conn.ping();
				} catch (e) {
					this.closeConn(conn);
					clearInterval(pingInterval);
				}
			}
		}, pingTimeout);
		conn.on("close", () => {
			this.closeConn(conn);
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
			syncProtocol.writeSyncStep1(encoder, this);
			this.send(conn, encoding.toUint8Array(encoder));
			const awarenessStates = this.awareness.getStates();

			if (awarenessStates.size > 0) {
				const encoder = encoding.createEncoder();
				encoding.writeVarUint(encoder, messageAwareness);
				encoding.writeVarUint8Array(
					encoder,
					YJS.encodeAwarenessUpdate(
						this.awareness,
						Array.from(awarenessStates.keys())
					)
				);

				this.send(conn, encoding.toUint8Array(encoder));
			}
		}

		this.broadcastPresenceUpdate();
	}

	broadcastAll(message: WSTypes.CustomMessage) {
		for (const ws of this.conns.keys()) {
			this.send(ws, SuperJSON.stringify(message));
		}
	}

	send(conn: WebSocket, m: Uint8Array | string) {
		if (
			conn.readyState !== wsReadyStateConnecting &&
			conn.readyState !== wsReadyStateOpen
		) {
			this.closeConn(conn);
		}
		try {
			conn.send(m, (err: unknown) => {
				err != null && this.closeConn(conn);
			});
		} catch (e) {
			this.closeConn(conn);
		}
	}

	closeConn = (conn: WebSocket) => {
		if (this.conns.has(conn)) {
			const controlledId = this.conns.get(conn)?.clientInfo?.clientId;
			this.conns.delete(conn);

			if (this.conns.size === 0) {
				docs.delete(this.name);
			}

			if (controlledId) {
				YJS.removeAwarenessStates(this.awareness, [controlledId], null);
			}
			this.broadcastPresenceUpdate();
		}

		conn.close();
	};
}

/**
 * Gets a Y.Doc by name, whether in memory or on disk
 *
 * @param docname - the name of the Y.Doc to find or create
 * @param gc - whether to allow gc on the doc (applies only when created)
 */
export const getOrCreateYDoc = async (
	docname: string,
	redis: WsRedisType
): Promise<WSSharedDoc> => {
	const existingDoc = docs.get(docname);
	if (existingDoc) {
		return existingDoc;
	}

	const [storedDoc, permissions] = await Promise.all([
		redis.rpc("App", "GetDoc", {
			slug: docname,
		}),
		redis.rpc("App", "GetNotePermissions", {
			slug: docname,
		}),
	]);

	const newDoc = new WSSharedDoc(
		redis,
		docname,
		storedDoc.content,
		permissions.allowAnyoneToEdit,
		permissions.creatorId
	);
	docs.set(docname, newDoc);
	return newDoc;
};

const pingTimeout = 5000;
