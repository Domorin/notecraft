import { createClient } from "redis";
import SuperJSON from "superjson";
import { logger } from "../logging/log";
import { PrismaNoteMetadata } from "../prisma/types";

type Service = "App" | "Ws";

type RPCs = {
	App: {
		GetNotePermissions: {
			input: {
				slug: string;
			};
			output: {
				allowAnyoneToEdit: boolean;
				creatorId: string;
			};
		};
		SaveDoc: {
			input: {
				userId: string;
				slug: string;
				content: number[];
			};
			output: { success: boolean };
		};
		GetDoc: {
			input: {
				slug: string;
			};
			output: {
				content: number[];
			};
		};
	};
	Ws: {
		GetHost: {
			input: { slug: string };
			output: { hostId: string | undefined };
		};
	};
};

type ServiceRPCs<S extends Service> = {
	[Thing in keyof RPCs[S]]: (
		args: RPCs[S][Thing] extends { input: Record<string, unknown> }
			? RPCs[S][Thing]["input"]
			: never
	) => RPCs[S][Thing] extends {
		output: Record<string, unknown>;
	}
		? Promise<RPCs[S][Thing]["output"]>
		: never;
};

type ServiceRPCsWithError<S extends Service> = {
	[Thing in keyof RPCs[S]]: (
		args: RPCs[S][Thing] extends { input: Record<string, unknown> }
			? RPCs[S][Thing]["input"]
			: never
	) => RPCs[S][Thing] extends {
		output: Record<string, unknown>;
	}
		? Promise<RPCs[S][Thing]["output"] | { _err: string }>
		: never;
};

export const pendingMessages: Record<
	number,
	{
		resolve: (value: unknown) => void;
		reject: (reason?: unknown) => void;
	}
> = {};

let number = 0;
export function getNextId() {
	return number++ % Number.MAX_SAFE_INTEGER;
}

export type RedisChannelType = {
	NoteMetadataUpdate: Omit<PrismaNoteMetadata, "creatorId">;
	RPCRequest: {
		id: number;
		rpc: string;
		source: Service;
		target: Service;
		input: Record<string, unknown>;
		ignoreResponse?: boolean;
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
	rpcHandler: ServiceRPCsWithError<T>;
}) {
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

	logger.info("Connecting to redis...");
	const publisherConnectPromise = publisherClient
		.connect()
		.then(() => logger.info("Connected to redis publisher"));
	const subscriberConnectPromise = subscriberClient
		.connect()
		.then(() => logger.info("Connected to redis subscriber"));

	publisherClient.on("error", (err) =>
		logger.error("Redis Client Error", err)
	);

	const pubsubHandler = {
		publish: async <Channel extends keyof RedisChannelType>(
			channel: Channel,
			message: RedisChannelType[Channel]
		) => {
			await publisherConnectPromise;

			const redis = publisherClient;
			redis.publish(channel, SuperJSON.stringify(message));
		},
		subscribe: async <Channel extends keyof RedisChannelType>(
			channel: Channel,
			callback: (message: RedisChannelType[Channel]) => void
		) => {
			await subscriberConnectPromise;
			const redis = subscriberClient;

			redis.subscribe(channel, (message) => {
				const parsedMessage = SuperJSON.parse(
					message
				) as RedisChannelType[Channel];

				callback(parsedMessage);
			});
		},
	};

	pubsubHandler.subscribe("RPCRequest", async (message) => {
		// This request is not for us
		if (message.target !== context.service) {
			return;
		}

		const result = await context.rpcHandler[message.rpc as keyof RPCs[T]](
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			message.input as any
		);

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

		const outputAsObject = message.output as object;
		// If _err exists in output, reject with the err
		if ("_err" in outputAsObject) {
			pendingMessages[message.id]?.reject(outputAsObject._err);
			return;
		}

		pendingMessages[message.id]?.resolve(message.output);
	});

	const TimeoutMS = 30 * 1000;
	async function rpc<
		Target extends keyof Omit<RPCs, T>,
		RPC extends keyof RPCs[Target] & string,
		IgnoreResponse extends boolean = false
	>(
		target: Target,
		rpc: RPC,
		input: Parameters<ServiceRPCs<Target>[RPC]>[0],
		opts: { ignoreResponse: IgnoreResponse } = {
			ignoreResponse: false as const,
		} as { ignoreResponse: IgnoreResponse }
	): Promise<
		IgnoreResponse extends false
			? ReturnType<ServiceRPCs<Target>[RPC]>
			: undefined
	> {
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
			return undefined as IgnoreResponse extends false
				? ReturnType<ServiceRPCs<Target>[RPC]>
				: undefined;
		}

		let timeout: NodeJS.Timeout;
		const promise = new Promise<unknown>((resolve, reject) => {
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
		return promise as IgnoreResponse extends false
			? ReturnType<ServiceRPCs<Target>[RPC]>
			: undefined;
	}

	return { client: publisherClient, pubsub: pubsubHandler, rpc };
}
