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
				throw new Error("GetNotePermissions Error: No note found");
			}

			return note;
		},
	},
});
