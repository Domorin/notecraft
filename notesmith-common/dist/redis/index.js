import { createClient } from "redis";
import SuperJSON from "superjson";
import Logger from "../logging";
export const pendingMessages = {};
let number = 0;
export function getNextId() {
    return number++ % Number.MAX_SAFE_INTEGER;
}
export default function initRedis(context) {
    if (!process.env.REDIS_HOST) {
        throw new Error("REDIS_HOST not set");
    }
    const publisherClient = createClient({
        url: `redis://${process.env.REDIS_HOST}:6379`,
    });
    const subscriberClient = createClient({
        url: `redis://${process.env.REDIS_HOST}:6379`,
    });
    const service = context.service;
    Logger.info("Connecting to redis...");
    const publisherConnectPromise = publisherClient
        .connect()
        .then(() => Logger.info("Connected to redis publisher"));
    const subscriberConnectPromise = subscriberClient
        .connect()
        .then(() => Logger.info("Connected to redis subscriber"));
    publisherClient.on("error", (err) => Logger.error("Redis Client Error", err));
    const pubsubHandler = {
        publish: async (channel, message) => {
            await publisherConnectPromise;
            const redis = publisherClient;
            redis.publish(channel, SuperJSON.stringify(message));
        },
        subscribe: async (channel, callback) => {
            await subscriberConnectPromise;
            const redis = subscriberClient;
            redis.subscribe(channel, (message) => {
                const parsedMessage = SuperJSON.parse(message);
                callback(parsedMessage);
            });
        },
    };
    pubsubHandler.subscribe("RPCRequest", async (message) => {
        // This request is not for us
        if (message.target !== context.service) {
            return;
        }
        const result = await context.rpcHandler[message.rpc](
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        message.input);
        if (message.ignoreResponse) {
            return;
        }
        pubsubHandler.publish("RPCResponse", {
            id: message.id,
            source: message.source,
            target: message.target,
            output: result,
        });
    });
    pubsubHandler.subscribe("RPCResponse", async (message) => {
        // This response is not for us
        if (message.source !== context.service) {
            return;
        }
        const outputAsObject = message.output;
        // If _err exists in output, reject with the err
        if ("_err" in outputAsObject) {
            pendingMessages[message.id]?.reject(outputAsObject._err);
            return;
        }
        pendingMessages[message.id]?.resolve(message.output);
    });
    const TimeoutMS = 30 * 1000;
    async function rpc(target, rpc, input, opts = {
        ignoreResponse: false,
    }) {
        const id = getNextId();
        pubsubHandler.publish("RPCRequest", {
            id,
            rpc,
            source: service,
            target: target,
            input,
            ignoreResponse: opts.ignoreResponse,
        });
        if (opts.ignoreResponse === true) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return undefined;
        }
        let timeout;
        const promise = new Promise((resolve, reject) => {
            pendingMessages[id] = { resolve, reject };
            timeout = setTimeout(() => {
                if (pendingMessages[id]) {
                    reject(`${service}_${rpc}: Request timed out`);
                }
            }, TimeoutMS);
        }).finally(() => {
            clearTimeout(timeout);
            delete pendingMessages[id];
        });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return promise;
    }
    return { client: publisherClient, pubsub: pubsubHandler, rpc };
}
