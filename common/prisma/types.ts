import { Prisma } from "@prisma/client";
import { DefaultArgs } from "@prisma/client/runtime";

export type NoteFindUniqueParams = {
	rejectOnNotFound?: Prisma.RejectOnNotFound | undefined;
	select?: Prisma.NoteSelect<DefaultArgs> | null | undefined;
	include?: Prisma.NoteInclude<DefaultArgs> | null | undefined;
	where: Prisma.NoteWhereUniqueInput;
};
export type NoteSelectParameters = NoteFindUniqueParams["select"];

export const NoteMetadataValues = {
	slug: true,
	updatedAt: true,
	createdAt: true,
	viewedAt: true,
	views: true,
	title: true,
	allowAnyoneToEdit: true,
	creatorId: true,
} satisfies NoteSelectParameters;

export type PrismaNoteMetadata = Prisma.NoteGetPayload<{
	select: typeof NoteMetadataValues;
}>;
