import { trpc } from "@/utils/trpc";
import { useNoteListRecent } from "../use_recent_local_storage";
import { DateTime } from "luxon";
import { useQuery } from "@tanstack/react-query";
import { getQueryKey } from "@trpc/react-query";

export function useNoteListRecentsQuery() {
	const context = trpc.useContext();
	const { recents, sync } = useNoteListRecent();

	// TODO: figure out how to deal with recents
	// useQueries might work, but itll fuck up with the shitty error handling business
	// We could always pass meta tag to the error callback to tell it to not redirect
	// trpc.useQueries((t) => )

	// Though the listCreated query returns a list of metadata, we consider the canonical data to be in the `metadata` query.
	// This query should only be used for sorting, hence the `select` call only returning slugs
	return useQuery(getQueryKey(trpc.note.listSlugs, recents), {
		queryFn: async () => {
			const notes = await context.client.note.listSlugs.query({
				slugs: Object.keys(recents),
			});

			sync(notes.map((val) => val.slug));

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
		select: (data) => {
			return data
				.map((val) => ({
					slug: val.slug,
					date: DateTime.fromJSDate(recents[val.slug]),
				}))
				.sort((a, b) => {
					return b.date.toMillis() - a.date.toMillis();
				});
		},
	});
}
