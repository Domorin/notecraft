import { WebSocketServer, WebSocket } from "ws";
import http, { IncomingMessage } from "http";
import * as cookie from "cookie";

const wss = new WebSocketServer({ noServer: true });
import { docs, getOrCreateYDoc, setupWSConnection } from "./utils";
import { initRedis } from "../../common/redis/redis";
import { CustomMessage } from "./types";
import { logger } from "../../common/logging/log";

// TODO: from envirment
export const host = "localhost";
const port = 4444;

export type WsRedisType = ReturnType<typeof initRedis<"Ws">>;

function initWSServer() {
	const server = http.createServer((request, response) => {
		response.writeHead(200, { "Content-Type": "text/plain" });
		response.end("okay");
	});

	const redis = initRedis({
		service: "Ws",
		rpcHandler: {
			GetHost: async (message) => {
				const connections = docs.get(message.slug)?.conns;

				if (!connections) {
					logger.warn(
						"Trying to get host before connection is established"
					);
					return { hostId: undefined };
				}

				const hostId = [...connections.values()][0]?.userId;

				if (!hostId) {
					throw new Error(`No host found for room ${message.slug}`);
				}

				return {
					hostId,
				};
			},
		},
	});

	function docBroadcastAll(topicName: string, message: CustomMessage) {
		docs.get(topicName)?.broadcastAll(message);
	}

	// Subscribe to NoteMetadataUpdate from redis; broadcast to all connections
	redis.pubsub.subscribe("NoteMetadataUpdate", (message) => {
		docBroadcastAll(message.slug, {
			type: "noteMetadataUpdate",
			...message,
		});
	});

	wss.on("connection", (a: WebSocket, b: string, c: IncomingMessage) =>
		setupWSConnection(redis, a, b, c)
	);

	server.on("upgrade", (request, socket, head) => {
		// You may check auth of request here..
		// See https://github.com/websockets/ws#client-authentication

		const userId = cookie.parse(request.headers.cookie || "")["id"];

		if (!userId) {
			throw new Error("No user ID found!");
		}

		const handleAuth = (ws: WebSocket) => {
			wss.emit("connection", ws, userId, request);
		};
		wss.handleUpgrade(request, socket, head, handleAuth);
	});

	server.listen(port, () => {
		console.log(`running at '${host}' on port ${port}`);
	});
}

initWSServer();
