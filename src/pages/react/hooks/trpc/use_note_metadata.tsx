import { useIsFetching, useQueryClient } from "@tanstack/react-query";
import { RouterInput } from "@/server/routers/_app";
import { getQueryKey } from "@trpc/react-query";
import { trpc } from "@/utils/trpc";

export function useGetNoteMetadata(slug: string) {
	const context = trpc.useContext();

	// return context.note.listCreated.getData()?.find((val) => val.slug === slug) ?? context.;
}
