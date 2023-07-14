import { initRedis } from "../../common/redis/redis";

export const redis = initRedis({
	service: "App",
	rpcHandler: {},
});
