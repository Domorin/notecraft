import { z } from "zod";
import { prisma } from "../prisma";
import { procedure, router } from "../trpc";
import { Words } from "../words/words";
import { TRPCError } from "@trpc/server";

export const noteRouter = router({
	create: procedure.mutation(async ({ input }) => {
		const slug = await Words.getUniquePageSlug();

		const page = await prisma.note.create({
			data: {
				slug,
				content: "",
			},
		});
		return page;
	}),
	metadata: procedure
		.input(z.object({ slug: z.string() }))
		.query(async ({ input }) => {
			return prisma.note.findUnique({
				where: {
					slug: input.slug,
				},
				select: {
					slug: true,
					updatedAt: true,
					createdAt: true,
				},
			});
		}),
	content: procedure
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
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Note not found",
				});
			}

			return note;
		}),
	save: procedure
		.input(
			z.object({
				slug: z.string(),
				text: z.string(),
			})
		)
		.mutation(async ({ input }) => {
			return prisma.note.update({
				data: {
					content: input.text,
				},
				where: {
					slug: input.slug,
				},
			});
		}),
	list: procedure.query(async ({ input }) => {
		return prisma.note.findMany({
			select: {
				slug: true,
				createdAt: true,
				updatedAt: true,
			},
			orderBy: {
				updatedAt: "desc",
			},
		});
	}),
});
