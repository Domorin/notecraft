import { z } from "zod";
import { prisma } from "../prisma";
import { authedProcedure, procedure, router } from "../trpc";
import { Words } from "../words/words";
import { TRPCError } from "@trpc/server";

export const noteRouter = router({
	create: authedProcedure.mutation(async ({ input, ctx: { userId } }) => {
		const slug = await Words.getUniquePageSlug();

		const page = await prisma.note.create({
			data: {
				slug,
				content: "",
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

			return note;
		}),
	save: authedProcedure
		.input(
			z.object({
				slug: z.string(),
				text: z.string(),
			})
		)
		.mutation(async ({ input, ctx: { userId } }) => {
			const updatedAtDate = new Date();

			console.log("saving");

			return prisma.note.update({
				data: {
					content: input.text,
					updatedAt: updatedAtDate,
					viewedAt: updatedAtDate,
				},
				where: {
					slug: input.slug,
				},
			});
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
