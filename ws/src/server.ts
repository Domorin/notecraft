import * as cookie from "cookie";
import http from "http";
import { WebSocket, WebSocketServer } from "ws";

import { initRedis } from "../../common/redis/redis";
import { CustomMessage } from "../../common/ws/types";
import { docs, getOrCreateYDoc } from "./utils";
import { logger } from "../../common/logging/log";

const wss = new WebSocketServer({ noServer: true });

export type ConnConnection = {
	ws: WebSocket;
	userId: string;
};

// TODO: from envirment
export const host = "localhost";
const port = 4444;

export type WsRedisType = ReturnType<typeof initRedis<"Ws">>;

process
	.on("unhandledRejection", (reason, p) => {
		console.error(reason, "Unhandled Rejection at Promise", p);
	})
	.on("uncaughtException", (err) => {
		console.error(err, "Uncaught Exception thrown");
		process.exit(1);
	});

function initWSServer() {
	const server = http.createServer((request, response) => {
		response.writeHead(200, { "Content-Type": "text/plain" });
		response.end("okay");
	});

	const redis = initRedis({
		service: "Ws",
		rpcHandler: {
			GetHost: async (message) => {
				const doc = docs.get(message.slug);
				const connections = doc?.conns;

				if (!connections) {
					logger.warn(
						"Trying to get host before connection is established"
					);
					return { hostId: undefined };
				}

				const connectionsArray = [...connections.values()];

				// Prioritize the creator of the note as the host if they are present
				const hostId = (
					connectionsArray.find(
						(val) => val.userId === doc.creatorId
					) ?? connectionsArray[0]
				)?.userId;

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
		const doc = docs.get(message.slug);
		if (doc) {
			doc.allowEveryoneToEdit = message.allowAnyoneToEdit;
		}

		docBroadcastAll(message.slug, {
			type: "noteMetadataUpdate",
			...message,
		});
	});

	wss.on("connection", (conn: WebSocket, docName: string, userId: string) =>
		docs.get(docName)?.addConnection(conn, userId)
	);

	server.on("upgrade", async (request, socket, head) => {
		// You may check auth of request here..
		// See https://github.com/websockets/ws#client-authentication

		const userId = cookie.parse(request.headers.cookie || "")["id"];

		if (!userId) {
			throw new Error("No user ID found!");
		}

		const docName = request.url?.slice(1).split("?")[0];

		if (!docName) {
			throw new Error("Invalid doc name for websocket");
		}

		await getOrCreateYDoc(docName, redis);

		const handleAuth = (ws: WebSocket) => {
			wss.emit("connection", ws, docName, userId);
		};

		wss.handleUpgrade(request, socket, head, handleAuth);
	});

	server.listen(4444, () => {
		logger.info(`running at '${host}' on port ${4444}`);
	});
}

initWSServer();
