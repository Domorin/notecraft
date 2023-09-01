import { router } from "../trpc";
import { adminProcedure } from "../providers/admin_procedure";
import { prisma } from "@/server/prisma";
import { PrismaTypes, YJS } from "@notecraft/common";
import * as Y from "yjs";

export const WelcomeMessageSlug = "welcome";

export const adminRouter = router({
	isAdmin: adminProcedure.query(async () => {
		return true;
	}),
	getOrCreateWelcomeMessage: adminProcedure.mutation(
		async ({ ctx: { user } }) => {
			let result = await prisma.note.findUnique({
				where: {
					slug: WelcomeMessageSlug,
				},
				select: PrismaTypes.NoteMetadataValues,
			});

			if (!result) {
				const buffer = Buffer.from(YJS.encodeYDocContent(new Y.Doc()));
				result = await prisma.note.create({
					data: {
						slug: WelcomeMessageSlug,
						allowAnyoneToEdit: false,
						content: buffer,
						creator: {
							connect: {
								id: user.id,
							},
						},
					},
					select: PrismaTypes.NoteMetadataValues,
				});
			}

			return result;
		}
	),
});
