import { trpc } from "@/utils/trpc";
import { useQueryClient } from "@tanstack/react-query";
import { getQueryKey } from "@trpc/react-query";
import { useCallback } from "react";
import { useNoteListRecent } from "../use_recents";
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
			queryClient.removeQueries(
				getQueryKey(
					trpc.note.content,
					{
						slug: slug,
					},
					"query"
				)
			);
			queryClient.removeQueries(
				getQueryKey(
					trpc.note.metadata,
					{
						slug: slug,
					},
					"query"
				)
			);
			remove(slug);
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[]
	);
}
