import { useIsFetching, useQueryClient } from "@tanstack/react-query";
import { RouterInput } from "@/server/routers/_app";
import { getQueryKey } from "@trpc/react-query";
import { trpc } from "@/utils/trpc";

export function useNoteMetadataQuery(slug: string | undefined) {
	return trpc.note.metadata.useQuery(
		{
			slug: slug!,
		},
		{
			enabled: !!slug,
			refetchOnMount: false,
		}
	);
}
