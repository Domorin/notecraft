import { router } from "../trpc";
import { adminProcedure } from "../providers/admin_procedure";
import { prisma } from "@/server/prisma";
import { PrismaTypes, YJS } from "@notecraft/common";
import * as Y from "yjs";
import { WelcomePageSlug } from "@/lib/default_pages";


export const adminRouter = router({
	isAdmin: adminProcedure.query(async () => {
		return true;
	}),
	getOrCreateWelcomeMessage: adminProcedure.mutation(
		async ({ ctx: { user } }) => {
			let result = await prisma.note.findUnique({
				where: {
					slug: WelcomePageSlug,
				},
				select: PrismaTypes.NoteMetadataValues,
			});

			if (!result) {
				const buffer = Buffer.from(YJS.encodeYDocContent(new Y.Doc()));
				result = await prisma.note.create({
					data: {
						slug: WelcomePageSlug,
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
