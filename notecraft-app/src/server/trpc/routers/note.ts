import { Prisma } from "@prisma/client";
import { yDocToProsemirrorJSON } from "y-prosemirror";

import * as Y from "yjs";
import { z } from "zod";

import { YJS, PrismaTypes } from "@notecraft/common";
import { titleLimiter } from "@/lib/validators";
import { prisma } from "@/server/prisma";
import { redis } from "@/server/redis";
import { getUniqueNoteSlug } from "@/server/words/words";
import { router } from "../trpc";
import { baseProcedure } from "../providers/base_procedure";
import { TRPCError } from "@trpc/server";

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
	metadataWithCreatorId: PrismaTypes.PrismaNoteMetadata & {
		creatorId: string;
	},
	user: string
) {
	const { creatorId, ...metadata } = metadataWithCreatorId;

	return {
		...metadata,
		isCreatedByYou: creatorId === user,
	};
}

export async function updateNoteMetadataForWeb(
	user: string,
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
			message: `Note not found (${params.where.slug})`,
		});
	}

	const canEdit =
		note.creatorId === user ||
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
		select: PrismaTypes.NoteMetadataValues,
	});

	const parsedNote = parseNoteMetadataForWeb(updateResult, user);

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
	create: baseProcedure
		.input(
			z.object({
				duplicatedSlug: z.string().optional(),
			})
		)
		.mutation(async ({ input, ctx: { user } }) => {
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
						message: `Note not found (${input.duplicatedSlug})`,
					});
				}

				buffer = duplicatedNote.content;
			} else {
				buffer = Buffer.from(YJS.encodeYDocContent(new Y.Doc()));
			}

			const note = await prisma.note.create({
				data: {
					slug,
					content: buffer,
					creator: {
						connectOrCreate: {
							create: {
								id: user.id,
							},
							where: {
								id: user.id,
							},
						},
					},
				},
				select: PrismaTypes.NoteMetadataValues,
			});
			return parseNoteMetadataForWeb(note, user.id);
		}),
	metadata: baseProcedure
		.input(z.object({ slug: z.string() }))
		.query(async ({ input, ctx: { user } }) => {
			const metadata = await prisma.note.findUnique({
				where: {
					slug: input.slug,
				},
				select: PrismaTypes.NoteMetadataValues,
			});

			if (!metadata) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: `Note not found (${input.slug})`,
				});
			}

			return parseNoteMetadataForWeb(metadata, user.id);
		}),
	htmlContent: baseProcedure
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

			const doc = YJS.parseYDocContent(note.content);

			return { docJson: yDocToProsemirrorJSON(doc, "default") };
		}),
	updateTitle: baseProcedure
		.input(
			z.object({
				slug: z.string(),
				title: titleLimiter,
			})
		)
		.mutation(async ({ input, ctx: { user } }) => {
			return updateNoteMetadataForWeb(user.id, {
				data: { title: input.title, updatedAt: new Date() },
				where: {
					slug: input.slug,
				},
				requireCreator: false,
			});
		}),
	updateEditPermissions: baseProcedure
		.input(
			z.object({
				slug: z.string(),
				allowAnyoneToEdit: z.boolean(),
			})
		)
		.mutation(async ({ input, ctx: { user } }) => {
			return updateNoteMetadataForWeb(user.id, {
				where: {
					slug: input.slug,
				},
				data: {
					allowAnyoneToEdit: input.allowAnyoneToEdit,
				},
				requireCreator: true,
			});
		}),
	listCreated: baseProcedure.query(async ({ ctx: { user } }) => {
		return prisma.note
			.findMany({
				select: PrismaTypes.NoteMetadataValues,
				orderBy: {
					updatedAt: "desc",
				},
				where: {
					creatorId: user.id,
				},
			})
			.then((val) =>
				val.map((note) => parseNoteMetadataForWeb(note, user.id))
			);
	}),
	delete: baseProcedure
		.input(
			z.object({
				slug: z.string(),
			})
		)
		.mutation(async ({ input, ctx: { user } }) => {
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
					message: `Note not found (${input.slug})`,
				});
			}

			if (note.creatorId !== user.id) {
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
