import { initRedis } from "../../redis/redis";

export const redis = initRedis({
	service: "App",
	rpcHandler: {},
});
