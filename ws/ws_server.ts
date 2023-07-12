#!/usr/bin/env node

import { WebSocketServer, WebSocket } from "ws";
import http from "http";
import * as map from "lib0/map";
import { redisHandler } from "../redis/redis";

type Message =
	| {
			type: "subscribe" | "unsubscribe";
			topics: string[];
	  }
	| { type: "publish"; topic: string; clients: number }
	| { type: "ping" }
	| { type: "pong" }
	| CustomMessage;

export type CustomMessage = { type: "metadata"; activeConnections: number };

const wsReadyStateConnecting = 0;
const wsReadyStateOpen = 1;
const wsReadyStateClosing = 2; // eslint-disable-line
const wsReadyStateClosed = 3; // eslint-disable-line

const send = (conn: WebSocket, message: Message) => {
	if (
		conn.readyState !== wsReadyStateConnecting &&
		conn.readyState !== wsReadyStateOpen
	) {
		conn.close();
	}
	try {
		conn.send(JSON.stringify(message));
	} catch (e) {
		conn.close();
	}
};

function createWsServer() {
	const wss = new WebSocketServer({ noServer: true });

	redisHandler.subscribe("NoteUpdate", (message) =>
		console.log("got message:", message)
	);

	const pingTimeout = 30000;

	const port = 4444;

	const server = http.createServer((request, response) => {
		response.writeHead(200, { "Content-Type": "text/plain" });
		response.end("okay");
	});

	/**
	 * Map froms topic-name to set of subscribed clients.
	 * @type {Map<string, Set<any>>}
	 */
	const allTopics = new Map<string, Set<WebSocket>>();

	function broadcast(topicName: string, message: CustomMessage) {
		const receivers = allTopics.get(topicName);
		if (receivers) {
			receivers.forEach((receiver) => send(receiver, message));
		}
	}

	setInterval(() => {
		for (const key of allTopics.keys()) {
			const subs = allTopics.get(key);
			subs?.forEach((val) => {
				send(val, {
					type: "metadata",
					activeConnections: subs.size,
				});
			});
		}
	}, 1000);

	const onConnection = (conn: WebSocket) => {
		const subscribedTopicsForUser = new Set<string>();
		let closed = false;
		// Check if connection is still alive
		let pongReceived = true;
		const pingInterval = setInterval(() => {
			if (!pongReceived) {
				conn.close();
				clearInterval(pingInterval);
			} else {
				pongReceived = false;
				try {
					conn.ping();
				} catch (e) {
					conn.close();
				}
			}
		}, pingTimeout);

		conn.on("pong", () => {
			pongReceived = true;
		});
		conn.on("close", () => {
			subscribedTopicsForUser.forEach((topicName) => {
				const subs = allTopics.get(topicName) || new Set();

				subs.delete(conn);
				if (subs.size === 0) {
					allTopics.delete(topicName);
				}

				broadcast(topicName, {
					type: "metadata",
					activeConnections: subs.size,
				});
			});
			subscribedTopicsForUser.clear();
			closed = true;
		});
		conn.on("message", (message: object) => {
			let parsedMessage: Message;
			try {
				parsedMessage = JSON.parse(message.toString()) as Message;
			} catch (e) {
				console.log(e, message);
				return;
			}

			if (parsedMessage && parsedMessage.type && !closed) {
				switch (parsedMessage.type) {
					case "subscribe":
						(parsedMessage.topics || []).forEach((topicName) => {
							if (typeof topicName === "string") {
								// add conn to topic
								const topic = map.setIfUndefined(
									allTopics,
									topicName,
									() => new Set()
								);
								topic.add(conn);

								broadcast(topicName, {
									type: "metadata",
									activeConnections: topic.size,
								});

								// add topic to conn
								subscribedTopicsForUser.add(topicName);
							}
						});
						break;
					case "unsubscribe":
						(parsedMessage.topics || []).forEach((topicName) => {
							const subs = allTopics.get(topicName);
							if (subs) {
								subs.delete(conn);

								broadcast(topicName, {
									type: "metadata",
									activeConnections: subs.size,
								});
							}
						});
						break;
					case "publish":
						if (parsedMessage.topic) {
							const receivers = allTopics.get(
								parsedMessage.topic
							);
							if (receivers) {
								parsedMessage.clients = receivers.size;
								receivers.forEach((receiver) =>
									send(receiver, parsedMessage)
								);
							}
						}
						break;
					case "ping":
						send(conn, { type: "pong" });
				}
			}
		});
	};

	wss.on("connection", onConnection);

	server.on("upgrade", (request, socket, head) => {
		// You may check auth of request here..
		const handleAuth = (ws: WebSocket) => {
			wss.emit("connection", ws, request);
		};
		wss.handleUpgrade(request, socket, head, handleAuth);
	});
	server.listen(port);

	console.log("Signaling server running on localhost:", port);
}

createWsServer();
