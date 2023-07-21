import { z } from "zod";
import { prisma } from "../prisma";
import { authedProcedure, procedure, router } from "../trpc";
import { Words } from "../words/words";
import { TRPCError } from "@trpc/server";
import * as Y from "yjs";
import { redis } from "../redis";
import { encodeYDocContent } from "@/lib/ydoc_utils";
import { titleLimiter } from "@/lib/validators";

const zodListType = z.enum(["Created", "Viewed"]);
export type ListType = z.infer<typeof zodListType>;

export const noteRouter = router({
	create: authedProcedure.mutation(async ({ input, ctx: { userId } }) => {
		const slug = await Words.getUniquePageSlug();

		const ydoc = new Y.Doc();

		const page = await prisma.note.create({
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
					title: true,
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
	updateTitle: authedProcedure
		.input(
			z.object({
				slug: z.string(),
				title: titleLimiter,
			})
		)
		.mutation(async ({ input, ctx: { userId } }) => {
			const note = await prisma.note.update({
				data: {
					title: input.title,
					updatedAt: new Date(),
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
				title: note.title,
			});

			return note;
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
				title: note.title,
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
				title: true,
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
			const result = await prisma.note.findMany({
				select: {
					slug: true,
					createdAt: true,
					updatedAt: true,
					views: true,
					viewedAt: true,
					title: true,
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

			return input.slugs
				.map((slug) => {
					return result.find((note) => note.slug === slug);
				})
				.filter(
					(val): val is (typeof result)[number] => val !== undefined
				);
		}),
});
