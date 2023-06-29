import { z } from "zod";
import { procedure, router } from "../trpc";
import { testProcedure } from "./test";
import { prisma } from "../prisma";
import { v4 as uuidv4 } from "uuid";
import { Words } from "../words/words";
import { Prisma } from "@prisma/client";
export const appRouter = router({
	hello: procedure
		.input(
			z.object({
				text: z.string(),
			})
		)
		.query((opts) => {
			return {
				greeting: `hello ${opts.input.text}`,
			};
		}),
	createPage: procedure.mutation(async ({ input }) => {
		const slug = await Words.getUniquePageSlug();

		const page = await prisma.post.create({
			data: {
				slug,
				content: "",
			},
		});
		return page.slug;
	}),
	getPage: procedure
		.input(z.object({ slug: z.string() }))
		.query(async ({ input }) => {
			return prisma.post.findUnique({
				where: {
					slug: input.slug,
				},
			});
		}),
	savePage: procedure
		.input(
			z.object({
				slug: z.string(),
				text: z.string(),
			})
		)
		.mutation(async ({ input }) => {
			console.log("saving", input.slug, input.text);

			await prisma.post.update({
				data: {
					content: input.text,
				},
				where: {
					slug: input.slug,
				},
			});
		}),
	getAllSlugs: procedure.query(async ({ input }) => {
		return prisma.post.findMany({
			select: {
				slug: true,
			},
			orderBy: {
				updatedAt: "desc",
			},
		});
	}),
});

// export type definition of API
export type AppRouter = typeof appRouter;
