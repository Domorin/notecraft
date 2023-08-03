import { trpc } from "@/utils/trpc";
import { useQueryClient } from "@tanstack/react-query";
import { getQueryKey } from "@trpc/react-query";
import { useCallback } from "react";
import { useNoteListRecent } from "../use_recent_local_storage";
import { RouterOutput } from "@/server/routers/_app";

export function useDeleteNote() {
	const context = trpc.useContext();

	const queryClient = useQueryClient();

	const { remove } = useNoteListRecent();

	return useCallback(
		(slug: string) => {
			context.note.listCreated.setData(undefined, (data) =>
				data?.filter((val) => val.slug !== slug)
			);
			remove(slug);
			queryClient.setQueriesData(
				getQueryKey(trpc.note.listSlugs, undefined),
				(data) => {
					const typedData = data as RouterOutput["note"]["listSlugs"];
					return typedData.filter((val) => val.slug !== slug);
				}
			);

			queryClient.removeQueries(
				getQueryKey(trpc.note.content, {
					slug: slug,
				})
			);
			queryClient.removeQueries(
				getQueryKey(trpc.note.metadata, {
					slug: slug,
				})
			);
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[]
	);
}