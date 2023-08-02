import { trpc } from "@/utils/trpc";
import { useQueryClient } from "@tanstack/react-query";
import { getQueryKey } from "@trpc/react-query";
import { useCallback } from "react";

export function useDeleteNote() {
	const context = trpc.useContext();

	const queryClient = useQueryClient();

	return useCallback(
		(slug: string) => {
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
			context.note.listCreated.setData(undefined, (data) =>
				data?.filter((val) => val.slug !== slug)
			);
			// context.note.listSlugs.setData({}, (data) =>
			// 	data?.filter((val) => val.slug !== slug)
			// );
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[]
	);
}
