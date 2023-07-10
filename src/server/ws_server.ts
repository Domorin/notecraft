#!/usr/bin/env node

import { Server, WebSocket } from "ws";
import http from "http";
import * as map from "lib0/map";
import { connect } from "http2";

const wsReadyStateConnecting = 0;
const wsReadyStateOpen = 1;
const wsReadyStateClosing = 2; // eslint-disable-line
const wsReadyStateClosed = 3; // eslint-disable-line

const pingTimeout = 30000;

const port = process.env.PORT || 4444;
// @ts-ignore
const wss = new Server({ noServer: true });

const server = http.createServer((request, response) => {
	response.writeHead(200, { "Content-Type": "text/plain" });
	response.end("okay");
});

/**
 * Map froms topic-name to set of subscribed clients.
 * @type {Map<string, Set<any>>}
 */
const topics = new Map<string, Set<any>>();

/**
 * @param {any} conn
 * @param {object} message
 */
const send = (conn: WebSocket, message: any) => {
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

type Message =
	| {
			type: "subscribe" | "unsubscribe";
			topics: string[];
	  }
	| { type: "publish"; topic: string; clients: number }
	| { type: "ping" };

const onConnection = (conn: WebSocket) => {
	const subscribedTopics = new Set<string>();
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
		subscribedTopics.forEach((topicName) => {
			const subs = topics.get(topicName) || new Set();
			subs.delete(conn);
			if (subs.size === 0) {
				topics.delete(topicName);
			}
		});
		subscribedTopics.clear();
		closed = true;
	});
	conn.on("message", (message: object) => {
		const parsedMessage = JSON.parse(message.toString()) as Message;

		if (parsedMessage && parsedMessage.type && !closed) {
			switch (parsedMessage.type) {
				case "subscribe":
					(parsedMessage.topics || []).forEach((topicName) => {
						if (typeof topicName === "string") {
							// add conn to topic
							const topic = map.setIfUndefined(
								topics,
								topicName,
								() => new Set()
							);
							topic.add(conn);
							// add topic to conn
							subscribedTopics.add(topicName);
						}
					});
					break;
				case "unsubscribe":
					(parsedMessage.topics || []).forEach((topicName) => {
						const subs = topics.get(topicName);
						if (subs) {
							subs.delete(conn);
						}
					});
					break;
				case "publish":
					if (parsedMessage.topic) {
						const receivers = topics.get(parsedMessage.topic);
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
