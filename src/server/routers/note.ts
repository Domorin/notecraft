import { z } from "zod";
import { prisma } from "../prisma";
import { authedProcedure, procedure, router } from "../trpc";
import { Words } from "../words/words";
import { TRPCError } from "@trpc/server";
import * as Y from "yjs";
import { redis } from "../redis";
import { encodeYDocContent } from "@/lib/ydoc_utils";

export const noteRouter = router({
	create: authedProcedure.mutation(async ({ input, ctx: { userId } }) => {
		const slug = await Words.getUniquePageSlug();

		const ydoc = new Y.Doc();

		const page = await prisma.note.create({
			data: {
				slug,
				content: Buffer.from(encodeYDocContent(ydoc)),
				creatorId: userId,
			},
		});
		return page;
	}),
	metadata: authedProcedure
		.input(z.object({ slug: z.string() }))
		.query(async ({ input, ctx: { userId } }) => {
			const metadata = await prisma.note.findUnique({
				where: {
					slug: input.slug,
				},
				select: {
					slug: true,
					updatedAt: true,
					createdAt: true,
					viewedAt: true,
					views: true,
				},
			});

			if (!metadata) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Note not found",
				});
			}

			return metadata;
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
	save: authedProcedure
		.input(
			z.object({
				slug: z.string(),
				content: z.array(z.number().min(0).max(255)),
			})
		)
		.mutation(async ({ input, ctx: { userId } }) => {
			const updatedAtDate = new Date();

			const note = await prisma.note.update({
				data: {
					content: Buffer.from(input.content),
					updatedAt: updatedAtDate,
					viewedAt: updatedAtDate,
				},
				where: {
					slug: input.slug,
				},
			});

			redis.pubsub.publish("NoteMetadataUpdate", {
				createdAt: note.createdAt.toISOString(),
				updatedAt: note.updatedAt.toISOString(),
				slug: note.slug,
				viewedAt: note.viewedAt?.toISOString(),
				views: note.views,
			});

			return note;
		}),
	listCreated: authedProcedure.query(async ({ input, ctx: { userId } }) => {
		return prisma.note.findMany({
			select: {
				slug: true,
				createdAt: true,
				updatedAt: true,
				viewedAt: true,
				views: true,
			},
			orderBy: {
				updatedAt: "desc",
			},
			where: {
				creatorId: userId,
			},
		});
	}),
	listSlugs: authedProcedure
		.input(
			z.object({
				slugs: z.string().array(),
			})
		)
		.query(async ({ input, ctx: { userId } }) => {
			return prisma.note.findMany({
				select: {
					slug: true,
					createdAt: true,
					updatedAt: true,
					views: true,
				},
				orderBy: {
					updatedAt: "desc",
				},
				where: {
					slug: {
						in: input.slugs,
					},
				},
			});
		}),
});
