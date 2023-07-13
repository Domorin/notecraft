import { RouterOutput } from "@/server/routers/_app";
import { sleep } from "@/utils/misc";
import { Message } from "postcss";
import { createClient } from "redis";

type Service = "App" | "Ws";

type RPCs = {
	App: {};
	Ws: {
		GetHost: {
			input: { slug: string };
			output: { hostId: string };
		};
	};
};

type RPCSThing<T extends Service> = Omit<RPCs, T>;

type TEST = RPCSThing<"App">;

type ServiceRPCs<S extends Service> = {
	[Thing in keyof RPCs[S]]: (
		args: RPCs[S][Thing] extends { input: Record<string, unknown> }
			? RPCs[S][Thing]["input"]
			: never
	) => RPCs[S][Thing] extends { output: Record<string, unknown> }
		? RPCs[S][Thing]["output"]
		: never;
};

type RedisContext = {
	rpcHandler: Record<
		string,
		(args: Record<string, unknown>) => Promise<unknown>
	>;
	service: Service;
};

export const pendingMessages: Record<
	number,
	{
		resolve: (value: unknown) => void;
		reject: (reason?: any) => void;
	}
> = {};

let number = 0;
export function getNextId() {
	return number++ % Number.MAX_SAFE_INTEGER;
}

export type RedisChannelType = {
	NoteMetadataUpdate: RouterOutput["note"]["metadata"];
	RPCRequest: {
		id: number;
		rpc: string;
		source: Service;
		target: Service;
		input: Record<string, unknown>;
	};
	RPCResponse: {
		id: number;
		source: Service;
		target: Service;
		output: unknown;
	};
};

export function initRedis<T extends Service>(context: {
	service: T;
	rpcHandler: ServiceRPCs<T>;
}) {
	const publisherClient = createClient({
		url: `redis://${process.env.REDIS_HOST}:6379`,
	});
	const subscriberClient = createClient({
		url: `redis://${process.env.REDIS_HOST}:6379`,
	});

	const service = context.service;

	console.log(service, "Connecting to redis...");
	const publisherConnectPromise = publisherClient
		.connect()
		.then(() => "Connected to redis publisher");
	const subscriberConnectPromise = subscriberClient
		.connect()
		.then(() => "Connected to redis subscriber");

	publisherClient.on("error", (err) =>
		console.log("Redis Client Error", err)
	);

	const redisHandler = {
		publish: async <Channel extends keyof RedisChannelType>(
			channel: Channel,
			message: RedisChannelType[Channel]
		) => {
			await publisherConnectPromise;

			const redis = publisherClient;
			console.log("isReady", redis.isReady);
			redis.publish(channel, JSON.stringify(message));
		},
		subscribe: async <Channel extends keyof RedisChannelType>(
			channel: Channel,
			callback: (message: RedisChannelType[Channel]) => void
		) => {
			await subscriberConnectPromise;

			const redis = subscriberClient;
			redis.subscribe(channel, (message) => {
				const parsedMessage = JSON.parse(
					message
				) as RedisChannelType[Channel];

				callback(parsedMessage);
			});
		},
	};

	redisHandler.subscribe("RPCRequest", async (message) => {
		// This request is not for us
		if (message.target !== context.service) {
			return;
		}

		const result = await context.rpcHandler[message.rpc as keyof RPCs[T]](
			message.input as any
		);

		redisHandler.publish("RPCResponse", {
			id: message.id,
			source: message.source,
			target: message.target,
			output: result,
		});
	});

	redisHandler.subscribe("RPCResponse", async (message) => {
		// This response is not for us
		if (message.source !== context.service) {
			return;
		}

		await sleep(5000);

		pendingMessages[message.id]?.resolve(message.output);
	});

	const TimeoutMS = 0;

	async function rpc<
		Target extends keyof Omit<RPCs, T>,
		RPC extends keyof RPCs[Target] & string
	>(
		target: Target,
		rpc: RPC,
		input: Parameters<ServiceRPCs<Target>[RPC]>[0]
	): Promise<ReturnType<ServiceRPCs<Target>[RPC]>> {
		const id = getNextId();
		redisHandler.publish("RPCRequest", {
			id,
			rpc,
			source: service,
			target: target,
			input,
		});

		let timeout: NodeJS.Timeout;
		const promise = new Promise<unknown>((resolve, reject) => {
			pendingMessages[id] = { resolve, reject };
			timeout = setTimeout(() => {
				if (pendingMessages[id]) {
					reject("Request timed out");
				}
			}, TimeoutMS);
		}).finally(() => {
			clearTimeout(timeout);
			delete pendingMessages[id];
		});

		return promise as Promise<ReturnType<ServiceRPCs<Target>[RPC]>>;
	}

	return { client: publisherClient, pubsub: redisHandler, rpc };
}
