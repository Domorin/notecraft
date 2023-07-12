import { createClient } from "redis";

let client: ReturnType<typeof createClient>;
export async function getRedis() {
	if (!client) {
		client = createClient({
			url: `redis://${process.env.REDIS_HOST}:6379`,
		});

		client.on("error", (err) => console.log("Redis Client Error", err));

		console.log("Connecting to redis...");
		await client.connect();
		console.log("Connected to redis!");
	}

	return client;
}

type RedisChannel = "NoteUpdate";

export const redisHandler = {
	publish: async (channel: RedisChannel, message: string) => {
		const redis = await getRedis();
		redis.publish(channel, message);
	},
	subscribe: async <Channel extends RedisChannel>(
		channel: Channel,
		callback: (message: string) => void
	) => {
		const redis = await getRedis();
		redis.subscribe(channel, (message) => callback(message));
	},
};
