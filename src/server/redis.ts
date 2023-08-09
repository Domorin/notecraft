import { initRedis } from "../../common/redis/redis";
import { prisma } from "./prisma";

export const redis = initRedis({
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
	},
});
