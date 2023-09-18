import { trpc } from "@/utils/trpc";
import { useQuery } from "@tanstack/react-query";
import { getQueryKey } from "@trpc/react-query";
import { DateTime } from "luxon";

export function useNoteListCreatedQuery() {
	const context = trpc.useContext();

	// Though the listCreated query returns a list of metadata, we consider the canonical data to be in the `metadata` query.
	// This query should only be used for sorting, hence the `select` call only returning slugs
	return useQuery(getQueryKey(trpc.note.listCreated, undefined, "query"), {
		queryFn: async () => {
			const notes = await context.client.note.listCreated.query(
				undefined
			);

			notes.forEach((val) =>
				context.note.metadata.setData(
					{
						slug: val.slug,
					},
					val
				)
			);

			return notes;
		},
		select: (data) =>
			data
				.map((val) => ({
					slug: val.slug,
					date: DateTime.fromJSDate(val.updatedAt),
				}))
				.sort((a, b) => b.date.toMillis() - a.date.toMillis()),
	});
}
