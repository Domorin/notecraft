import { WebSocketServer, WebSocket } from "ws";
import http from "http";
import * as cookie from "cookie";

const wss = new WebSocketServer({ noServer: true });
import { setupWSConnection } from "./utils";

// TODO: from envirment
export const host = "localhost";
const port = 4444;

const server = http.createServer((request, response) => {
	response.writeHead(200, { "Content-Type": "text/plain" });
	response.end("okay");
});

wss.on("connection", setupWSConnection);

server.on("upgrade", (request, socket, head) => {
	// You may check auth of request here..
	// See https://github.com/websockets/ws#client-authentication

	const userId = cookie.parse(request.headers.cookie || "")["id"];

	if (!userId) {
		throw new Error("No user ID found!");
	}

	const handleAuth = (ws: WebSocket) => {
		wss.emit("connection", ws, request);
	};
	wss.handleUpgrade(request, socket, head, handleAuth);
});

server.listen(port, () => {
	console.log(`running at '${host}' on port ${port}`);
});
