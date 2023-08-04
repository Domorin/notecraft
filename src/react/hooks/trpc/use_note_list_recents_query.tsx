import { trpc } from "@/utils/trpc";
import { DateTime } from "luxon";
import { useNoteListRecent } from "../use_recents";
import { TRPCClientError } from "@trpc/client";
import { createErrorMetadata } from "@/react/utils/error_handler";
import { makeMetadataDefaultOptions } from "./use_note_metadata_query";

export function useNoteListRecentsQuery() {
	const { recents, add, remove } = useNoteListRecent();

	const recentSlugs = Object.keys(recents).sort(
		(a, b) => recents[b].getTime() - recents[a].getTime()
	);

	const queries = trpc.useQueries((t) => {
		return recentSlugs.map((val) =>
			t.note.metadata(
				{ slug: val },
				{ ...(makeMetadataDefaultOptions(val) as any) }
			)
		);
	});

	const isLoading = queries.some((val) => val.isLoading);
	const successfulQueries = queries.flatMap((val) =>
		val.isSuccess ? [val] : []
	);
	// Remove not found pages from local storage

	return {
		isLoading,
		queries: successfulQueries.map((val) => ({
			slug: val.data.slug,
			date: DateTime.fromJSDate(recents[val.data.slug]),
		})),
	};
}
