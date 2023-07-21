import { trpc } from "@/utils/trpc";
import { useNoteListRecent } from "../use_recent_local_storage";
import { DateTime } from "luxon";

export function useNoteListRecentsQuery() {
	const context = trpc.useContext();
	const [recents] = useNoteListRecent();
	// Though the listCreated query returns a list of metadata, we consider the canonical data to be in the `metadata` query.
	// This query should only be used for sorting, hence the `select` call only returning slugs
	return trpc.note.listSlugs.useQuery(
		{
			slugs: Object.keys(recents),
		},
		{
			queryFn: async () => {
				const notes = await context.client.note.listSlugs.query({
					slugs: Object.keys(recents),
				});

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
						date: DateTime.fromJSDate(recents[val.slug]),
					}))
					.sort((a, b) => {
						return b.date.toMillis() - a.date.toMillis();
					}),
		}
	);
}
