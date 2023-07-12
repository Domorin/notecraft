import { createClient } from "redis";

let client: ReturnType<typeof createClient>;
export async function getRedis() {
	if (!client) {
		client = createClient({
			url: `redis://${process.env.REDIS_HOST}:6379`,
		});

		client.on("error", (err) => console.log("Redis Client Error", err));

		await client.connect();
	}

	return client;
}
