#!/usr/bin/env node

import { WebSocketServer, WebSocket } from "ws";
import http from "http";
import * as map from "lib0/map";
import { RedisChannelType, initRedis } from "../common/redis/redis";
import { logger } from "../common/logging/log";
import * as cookie from "cookie";
import { getUsername } from "./usernames";

const colorPalette = [
	"#ff0000", // red
	"#00ff00", // green
	"#0000ff", // blue
	"#ffff00", // yellow
	"#ff00ff", // magenta
	"#00ffff", // cyan
	"#ffa500", // orange
	"#800080", // purple
	"#008000", // dark green
	"#000080", // navy blue
	"#ffc0cb", // pink
	"#800000", // maroon
	"#ffd700", // gold
	"#008080", // teal
	"#808080", // gray
	"#c0c0c0", // silver
	"#ffffff", // white
	"#000000", // black
	"#ff1493", // deep pink
	"#a52a2a", // brown
];

type Message =
	| {
			type: "subscribe" | "unsubscribe";
			topics: [string];
	  }
	| { type: "publish"; topic: string; clients: number }
	| { type: "ping" }
	| { type: "pong" }
	| CustomMessage;

export type CustomMessage =
	| { type: "connectionMetadata"; activeConnections: number }
	| ({
			type: "noteMetadataUpdate";
	  } & RedisChannelType["NoteMetadataUpdate"])
	| {
			type: "createUser";
			name: string;
			color: string;
	  };

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

type WebsocketUser = { socket: WebSocket; userId: string; userName: string };

type AllTopicsStore = Map<
	string,
	{ connCount: number; userMap: Map<string, WebsocketUser> }
>;

const pingTimeout = 5000;

async function createWsServer() {
	const wss = new WebSocketServer({ noServer: true });

	const port = 4444;

	const server = http.createServer((request, response) => {
		response.writeHead(200, { "Content-Type": "text/plain" });
		response.end("okay");
	});

	const allTopics: AllTopicsStore = new Map();

	const redis = initRedis({
		service: "Ws",
		rpcHandler: {
			GetHost: (message) => {
				const connections = allTopics.get(message.slug);

				if (!connections) {
					throw new Error(
						`No connections found for room ${message.slug}`
					);
				}
				const [hostId] = connections.userMap.keys();

				if (!hostId) {
					throw new Error(`No host found for room ${message.slug}`);
				}

				return {
					hostId,
				};
			},
		},
	});

	function broadcast(topicName: string, message: CustomMessage) {
		const receivers = allTopics.get(topicName);
		if (receivers) {
			receivers.userMap.forEach((receiver) =>
				send(receiver.socket, message)
			);
		}
	}

	// Subscribe to NoteMetadataUpdate from redis; broadcast to all connections
	redis.pubsub.subscribe("NoteMetadataUpdate", (message) => {
		broadcast(message.slug, {
			type: "noteMetadataUpdate",
			...message,
		});
	});

	const onConnection = (conn: WebSocket, userId: string) => {
		let subscribedTopic: string | undefined;

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
			if (subscribedTopic) {
				const subs =
					allTopics.get(subscribedTopic)?.userMap ||
					(new Map() as Map<string, WebsocketUser>);

				subs.delete(userId);
				if (subs.size === 0) {
					allTopics.delete(subscribedTopic);
				}

				broadcast(subscribedTopic, {
					type: "connectionMetadata",
					activeConnections: subs.size,
				});
			}
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
					case "subscribe": {
						const topicName = parsedMessage.topics[0];
						if (topicName && typeof topicName === "string") {
							// add conn to topic
							let topic = allTopics.get(topicName);
							if (!topic) {
								topic = {
									connCount: 0,
									userMap: new Map(),
								};
								allTopics.set(topicName, topic);
							}

							const topicUserMap = topic.userMap;

							const existingUser = topicUserMap.get(userId);
							if (existingUser && existingUser.socket === conn) {
								// User already exists for this topic, don't do anything
								return;
							}

							const existingNames = [...topicUserMap.values()]
								.filter((val) => val.userId !== userId)
								.map((val) => {
									return val.userName;
								});

							const name = getUsername(existingNames);
							topicUserMap.set(userId, {
								socket: conn,
								userId,
								userName: name,
							});

							topic.connCount++;

							broadcast(topicName, {
								type: "connectionMetadata",
								activeConnections: topicUserMap.size,
							});

							console.log(
								colorPalette[
									topic.connCount % colorPalette.length
								]
							);

							send(conn, {
								type: "createUser",
								name,
								color: colorPalette[
									topic.connCount % colorPalette.length
								],
							});

							// add topic to conn
							subscribedTopic = topicName;
						}
						break;
					}
					case "unsubscribe": {
						{
							const topicName = parsedMessage.topics[0];
							if (topicName) {
								const subs = allTopics.get(topicName)?.userMap;
								if (subs) {
									subs.delete(userId);
									subscribedTopic = undefined;

									broadcast(topicName, {
										type: "connectionMetadata",
										activeConnections: subs.size,
									});
								}
							}
							break;
						}
					}
					case "publish":
						if (parsedMessage.topic) {
							const receivers = allTopics.get(
								parsedMessage.topic
							)?.userMap;
							if (receivers) {
								parsedMessage.clients = receivers.size;
								receivers.forEach((receiver) =>
									send(receiver.socket, parsedMessage)
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

		const userId = cookie.parse(request.headers.cookie || "")["id"];

		if (!userId) {
			throw new Error("No user ID found!");
		}

		const handleAuth = (ws: WebSocket) => {
			wss.emit("connection", ws, userId, request);
		};
		wss.handleUpgrade(request, socket, head, handleAuth);
	});
	server.listen(port);

	logger.info("Signaling server running on localhost:", port);
}

createWsServer();
