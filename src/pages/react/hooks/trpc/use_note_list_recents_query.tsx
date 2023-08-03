import { trpc } from "@/utils/trpc";
import { useNoteListRecent } from "../use_recent_local_storage";
import { DateTime } from "luxon";
import { useQuery } from "@tanstack/react-query";
import { getQueryKey } from "@trpc/react-query";

export function useNoteListRecentsQuery() {
	const { recents, add, remove } = useNoteListRecent();

	const recentSlugs = Object.keys(recents).sort(
		(a, b) => recents[b].getTime() - recents[a].getTime()
	);

	const queries = trpc.useQueries((t) => {
		return recentSlugs.map((val) =>
			t.note.metadata(
				{ slug: val },
				{ refetchOnMount: false, meta: { slug: val } }
			)
		);
	});

	const isLoading = queries.some((val) => val.isLoading);
	const successfulQueries = queries.flatMap((val) =>
		val.isSuccess ? [val] : []
	);
	// Remove not found pages from local storage

	queries.forEach((val, index) => {
		if (!val.isError) {
			return;
		}

		if (val.error.data?.code === "NOT_FOUND") {
			remove(recentSlugs[index]);
		}
	});

	return {
		isLoading,
		queries: successfulQueries.map((val) => ({
			slug: val.data.slug,
			date: DateTime.fromJSDate(recents[val.data.slug]),
		})),
	};
}
