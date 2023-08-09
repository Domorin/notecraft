import { initRedis } from "../../common/redis/redis";
import { prisma } from "./prisma";
import { updateNoteMetadataForWeb } from "./routers/note";

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
		SaveDoc: async (message) => {
			const updatedAtDate = new Date();
			console.log("wtf?, received save message", new Date().getSeconds());
			console.log("WTF IS GOING ON");

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
	},
});
