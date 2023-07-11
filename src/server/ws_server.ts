#!/usr/bin/env node

import { WebSocketServer, WebSocket } from "ws";
import http from "http";
import * as map from "lib0/map";
import { applyWSSHandler } from "@trpc/server/adapters/ws";
import { AppRouter, appRouter } from "./routers/_app";
import { createContext } from "./trpc";
import { createHTTPServer } from "@trpc/server/adapters/standalone";

export function createWsServer() {
	// I don't know that we need context for this, I don't know whats happening with context
	const { server, listen } = createHTTPServer({
		router: appRouter,
		createContext,
	});

	// ws server
	const wss = new WebSocketServer({ server });
	applyWSSHandler<AppRouter>({
		wss,
		router: appRouter,
		createContext,
	});

	const wsReadyStateConnecting = 0;
	const wsReadyStateOpen = 1;
	const wsReadyStateClosing = 2; // eslint-disable-line
	const wsReadyStateClosed = 3; // eslint-disable-line

	const pingTimeout = 30000;

	const port = 4444;

	const topics = new Map<string, Set<WebSocket>>();

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
								console.log("sending", parsedMessage);
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
