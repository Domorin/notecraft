"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.host = void 0;
const cookie = __importStar(require("cookie"));
const http_1 = __importDefault(require("http"));
const ws_1 = require("ws");
const Redis_1 = __importDefault(require("@notesmith/common/Redis"));
const utils_js_1 = require("./utils.js");
const Logger_1 = __importDefault(require("@notesmith/common/Logger"));
const wss = new ws_1.WebSocketServer({ noServer: true });
// TODO: from envirment
exports.host = "localhost";
process
    .on("unhandledRejection", (reason, p) => {
    console.error(reason, "Unhandled Rejection at Promise", p);
})
    .on("uncaughtException", (err) => {
    console.error(err, "Uncaught Exception thrown");
    process.exit(1);
});
function initWSServer() {
    const server = http_1.default.createServer((request, response) => {
        response.writeHead(200, { "Content-Type": "text/plain" });
        response.end("okay");
    });
    const redis = (0, Redis_1.default)({
        service: "Ws",
        rpcHandler: {
            GetHost: async (message) => {
                const doc = utils_js_1.docs.get(message.slug);
                const connections = doc?.conns;
                if (!connections) {
                    Logger_1.default.warn("Trying to get host before connection is established");
                    return { hostId: undefined };
                }
                const connectionsArray = [...connections.values()];
                // Prioritize the creator of the note as the host if they are present
                const hostId = (connectionsArray.find((val) => val.userId === doc.creatorId) ?? connectionsArray[0])?.userId;
                if (!hostId) {
                    throw new Error(`No host found for room ${message.slug}`);
                }
                return {
                    hostId,
                };
            },
        },
    });
    function docBroadcastAll(topicName, message) {
        utils_js_1.docs.get(topicName)?.broadcastAll(message);
    }
    // Subscribe to NoteMetadataUpdate from redis; broadcast to all connections
    redis.pubsub.subscribe("NoteMetadataUpdate", (message) => {
        const doc = utils_js_1.docs.get(message.slug);
        if (doc) {
            doc.allowEveryoneToEdit = message.allowAnyoneToEdit;
        }
        docBroadcastAll(message.slug, {
            type: "noteMetadataUpdate",
            ...message,
        });
    });
    wss.on("connection", (conn, docName, userId) => utils_js_1.docs.get(docName)?.addConnection(conn, userId));
    server.on("upgrade", async (request, socket, head) => {
        // You may check auth of request here..
        // See https://github.com/websockets/ws#client-authentication
        const userId = cookie.parse(request.headers.cookie || "")["id"];
        if (!userId) {
            socket.destroy();
            throw new Error("No user ID found!");
        }
        const docName = request.url?.slice(1).split("?")[0];
        if (!docName) {
            socket.destroy();
            throw new Error("Invalid doc name for websocket");
        }
        await (0, utils_js_1.getOrCreateYDoc)(docName, redis);
        const handleAuth = (ws) => {
            wss.emit("connection", ws, docName, userId);
        };
        wss.handleUpgrade(request, socket, head, handleAuth);
    });
    server.listen(4444, () => {
        Logger_1.default.info(`running at '${exports.host}' on port ${4444}`);
    });
}
initWSServer();
