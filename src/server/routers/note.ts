import { z } from "zod";
import { prisma } from "../prisma";
import { authedProcedure, procedure, router } from "../trpc";
import { Words } from "../words/words";
import { TRPCError } from "@trpc/server";
import * as Y from "yjs";
import { redis } from "../redis";
import { encodeYDocContent } from "@/lib/ydoc_utils";
import { titleLimiter } from "@/lib/validators";
import { Prisma } from "@prisma/client";
import { data } from "autoprefixer";
import { sleep } from "@/lib/misc";

const zodListType = z.enum(["Created", "Viewed"]);
export type ListType = z.infer<typeof zodListType>;

type NoteFindUniqueParams = Parameters<typeof prisma.note.findUnique>[0];
type NoteSelectParameters = NoteFindUniqueParams["select"];

const NoteMetadataParameters = {
	slug: true,
	updatedAt: true,
	createdAt: true,
	viewedAt: true,
	views: true,
	title: true,
	allowAnyoneToEdit: true,
	creatorId: true,
} satisfies NoteSelectParameters;

type PrismaNoteMetadata = Prisma.NoteGetPayload<{
	select: typeof NoteMetadataParameters;
}>;

type f = Prisma.NoteUpdateArgs;

/**
 * This function is to ensure creatorId is not leaked to the client.
 * If a user get's access to a user's id, they can see all the notes they've created
 * Not a huge deal since all notes are public, but still shouldn't make it that easy
 */
function parseNoteMetadataForWeb(
	metadataWithCreatorId: PrismaNoteMetadata & { creatorId: string },
	userId: string
) {
	const { creatorId, ...metadata } = metadataWithCreatorId;

	return {
		...metadata,
		isCreatedByYou: creatorId === userId,
	};
}

async function updateNoteMetadataForWeb(
	userId: string,
	params: {
		data: Prisma.NoteUpdateInput;
		where: Prisma.NoteWhereUniqueInput;
	}
) {
	const note = await prisma.note.findUnique({
		where: params.where,
	});

	if (!note) {
		throw new TRPCError({
			code: "NOT_FOUND",
			message: "Note not found",
		});
	}

	if (!note.allowAnyoneToEdit && note.creatorId !== userId) {
		throw new TRPCError({
			code: "UNAUTHORIZED",
			message: "You can not edit this note",
		});
	}

	const updateResult = await prisma.note.update({
		// ...params,
		data: params.data,
		where: params.where,
		select: NoteMetadataParameters,
	});

	const parsedNote = parseNoteMetadataForWeb(updateResult, userId);

	redis.pubsub.publish("NoteMetadataUpdate", {
		createdAt: parsedNote.createdAt.toISOString(),
		updatedAt: parsedNote.updatedAt.toISOString(),
		slug: parsedNote.slug,
		viewedAt: parsedNote.viewedAt?.toISOString(),
		views: parsedNote.views,
		title: parsedNote.title,
		allowAnyoneToEdit: parsedNote.allowAnyoneToEdit,
	});

	return parsedNote;
}

export const noteRouter = router({
	create: authedProcedure.mutation(async ({ input, ctx: { userId } }) => {
		const slug = await Words.getUniqueNoteSlug();

		const ydoc = new Y.Doc();

		const note = await prisma.note.create({
			data: {
				slug,
				content: Buffer.from(encodeYDocContent(ydoc)),
				creator: {
					connectOrCreate: {
						create: {
							id: userId,
						},
						where: {
							id: userId,
						},
					},
				},
			},
		});
		return parseNoteMetadataForWeb(note, userId);
	}),
	metadata: authedProcedure
		.input(z.object({ slug: z.string() }))
		.query(async ({ input, ctx: { userId } }) => {
			const metadata = await prisma.note.findUnique({
				where: {
					slug: input.slug,
				},
				select: NoteMetadataParameters,
			});

			if (!metadata) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Note not found",
				});
			}

			return parseNoteMetadataForWeb(metadata, userId);
		}),
	content: authedProcedure
		.input(z.object({ slug: z.string() }))
		.query(async ({ input, ctx: { userId } }) => {
			const note = await prisma.note.findUnique({
				where: {
					slug: input.slug,
				},
				select: {
					content: true,
				},
			});

			if (!note) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Note not found",
				});
			}

			await prisma.note.update({
				data: {
					viewedAt: new Date(),
					views: {
						increment: 1,
					},
				},
				where: {
					slug: input.slug,
				},
			});

			return note.content;
		}),
	updateTitle: authedProcedure
		.input(
			z.object({
				slug: z.string(),
				title: titleLimiter,
			})
		)
		.mutation(async ({ input, ctx: { userId } }) => {
			return updateNoteMetadataForWeb(userId, {
				data: { title: input.title, updatedAt: new Date() },
				where: {
					slug: input.slug,
				},
			});
		}),
	updateEditPermissions: authedProcedure
		.input(
			z.object({
				slug: z.string(),
				allowAnyoneToEdit: z.boolean(),
			})
		)
		.mutation(async ({ input, ctx: { userId } }) => {
			return updateNoteMetadataForWeb(userId, {
				where: {
					slug: input.slug,
				},
				data: {
					allowAnyoneToEdit: input.allowAnyoneToEdit,
				},
			});
		}),
	save: authedProcedure
		.input(
			z.object({
				slug: z.string(),
				content: z.array(z.number().min(0).max(255)),
			})
		)
		.mutation(async ({ input, ctx: { userId } }) => {
			const updatedAtDate = new Date();

			const roomHost = await redis.rpc("Ws", "GetHost", {
				slug: input.slug,
			});

			// Only allow the room host to save so DB is not spammed
			if (roomHost.hostId !== userId) {
				return;
			}

			return updateNoteMetadataForWeb(userId, {
				data: {
					content: Buffer.from(input.content),
					updatedAt: updatedAtDate,
					viewedAt: updatedAtDate,
				},
				where: {
					slug: input.slug,
				},
			});
		}),
	listCreated: authedProcedure.query(async ({ input, ctx: { userId } }) => {
		return prisma.note
			.findMany({
				select: NoteMetadataParameters,
				orderBy: {
					updatedAt: "desc",
				},
				where: {
					creatorId: userId,
				},
			})
			.then((val) =>
				val.map((note) => parseNoteMetadataForWeb(note, userId))
			);
	}),
	delete: authedProcedure
		.input(
			z.object({
				slug: z.string(),
			})
		)
		.mutation(async ({ input, ctx: { userId } }) => {
			await sleep(2000);
			const note = await prisma.note.findUnique({
				where: {
					slug: input.slug,
				},
				select: {
					creatorId: true,
					slug: true,
					id: true,
				},
			});

			if (!note) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Note not found",
				});
			}

			if (note.creatorId !== userId) {
				throw new TRPCError({
					code: "UNAUTHORIZED",
					message: "You are not the creator of this note",
				});
			}
			await prisma.note.delete({
				where: {
					slug: input.slug,
				},
			});
		}),
});
