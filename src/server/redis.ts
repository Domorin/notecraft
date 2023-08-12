import { initRedis } from "../../common/redis/redis";
import { prisma } from "./prisma";
import { updateNoteMetadataForWeb } from "./routers/note";

/**
 * Instantiates a single instance redisClient and save it on the global object.
 * @link https://www.redis.io/docs/support/help-articles/nextjs-redis-client-dev-practices
 */

type AppRedis = ReturnType<typeof initRedis<"App">>;

const globalForRedis = globalThis as unknown as {
	redis: AppRedis | undefined;
};

// TODO: figure out why this is connecting twice on prod and make sure its fine too
export const redis: AppRedis =
	globalForRedis.redis ??
	initRedis({
		service: "App",
		rpcHandler: {
			GetNotePermissions: async (message) => {
				const note = await prisma.note.findUnique({
					where: {
						slug: message.slug,
					},
					select: {
						allowAnyoneToEdit: true,
						creatorId: true,
					},
				});

				if (!note) {
					return {
						_err: "GetNotePermissions error: Note not found",
					};
				}

				return note;
			},
			SaveDoc: async (message) => {
				const updatedAtDate = new Date();

				await updateNoteMetadataForWeb(message.userId, {
					data: {
						content: Buffer.from(message.content),
						updatedAt: updatedAtDate,
						viewedAt: updatedAtDate,
					},
					where: {
						slug: message.slug,
					},
					requireCreator: false,
				});

				return {
					success: true,
				};
			},
			GetDoc: async (message) => {
				const note = await prisma.note.findUnique({
					where: {
						slug: message.slug,
					},
					select: {
						content: true,
					},
				});

				if (!note) {
					return {
						_err: `GetDoc error: Note ${message.slug} not found`,
					};
				}

				return { content: Array.from(note.content) };
			},
		},
	});

// if (process.env.NODE_ENV !== "production") {
globalForRedis.redis = redis;
// }
