import { titleLimiter } from "@/lib/validators";
import { encodeYDocContent, parseYDocContent } from "@/lib/ydoc_utils";
import { Prisma } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import * as Y from "yjs";
import { z } from "zod";
import { prisma } from "../prisma";
import { redis } from "../redis";
import { authedProcedure, router } from "../trpc";
import { getUniqueNoteSlug } from "../words/words";
import { generateHTML } from "@tiptap/react";

type NoteFindUniqueParams = Parameters<typeof prisma.note.findUnique>[0];
type NoteSelectParameters = NoteFindUniqueParams["select"];

const NoteMetadataValues = {
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
	select: typeof NoteMetadataValues;
}>;

const ZodNoteContent = z.array(z.number().min(0).max(255));

export type CustomError = {
	code: "NOT_FOUND";
	message?: string;
};

function CreateCustomError(error: CustomError) {
	return error;
}

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
		requireCreator: boolean;
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

	const canEdit =
		(params.requireCreator && note.creatorId === userId) ||
		(!params.requireCreator && note.allowAnyoneToEdit);

	if (!canEdit) {
		throw new TRPCError({
			code: "UNAUTHORIZED",
			message: "You can not edit this note",
		});
	}

	const updateResult = await prisma.note.update({
		// ...params,
		data: params.data,
		where: params.where,
		select: NoteMetadataValues,
	});

	const parsedNote = parseNoteMetadataForWeb(updateResult, userId);

	redis.pubsub.publish("NoteMetadataUpdate", {
		createdAt: parsedNote.createdAt,
		updatedAt: parsedNote.updatedAt,
		slug: parsedNote.slug,
		viewedAt: parsedNote.viewedAt,
		views: parsedNote.views,
		title: parsedNote.title,
		allowAnyoneToEdit: parsedNote.allowAnyoneToEdit,
	});

	return parsedNote;
}

export const noteRouter = router({
	create: authedProcedure
		.input(
			z.object({
				duplicatedSlug: z.string().optional(),
			})
		)
		.mutation(async ({ input, ctx: { userId } }) => {
			const slug = await getUniqueNoteSlug();

			let buffer: Buffer | undefined;
			if (input.duplicatedSlug) {
				const duplicatedNote = await prisma.note.findUnique({
					where: {
						slug: input.duplicatedSlug,
					},
					select: {
						content: true,
					},
				});

				if (!duplicatedNote) {
					throw new TRPCError({
						code: "NOT_FOUND",
						message: "Note not found",
					});
				}

				buffer = duplicatedNote.content;
			} else {
				buffer = Buffer.from(encodeYDocContent(new Y.Doc()));
			}

			const note = await prisma.note.create({
				data: {
					slug,
					content: buffer,
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
				select: NoteMetadataValues,
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
				select: NoteMetadataValues,
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
		.query(async ({ input }) => {
			const note = await prisma.note.findUnique({
				where: {
					slug: input.slug,
				},
				select: {
					content: true,
				},
			});

			if (!note) {
				return CreateCustomError({ code: "NOT_FOUND" });
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

			return Array.from(note.content);
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
				requireCreator: false,
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
				requireCreator: true,
			});
		}),
	save: authedProcedure
		.input(
			z.object({
				slug: z.string(),
				content: ZodNoteContent,
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
				requireCreator: false,
			});
		}),
	listCreated: authedProcedure.query(async ({ ctx: { userId } }) => {
		return prisma.note
			.findMany({
				select: NoteMetadataValues,
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
