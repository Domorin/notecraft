import { useNoteContentQuery } from "../../hooks/trpc/use_note_content_query";
import { usePageSlug } from "../../hooks/use_page_id";
import { Spinner } from "../spinner";
import { NoteWithLoadedContent } from "./note_with_loaded_content";

export default function Note() {
	const slug = usePageSlug();

	const contentQuery = useNoteContentQuery(slug);

	if (!contentQuery.isSuccess) {
		return <Spinner />;
	}

	if (!slug) {
		// This should be impossible
		throw new Error("Slug is undefined");
	}

	return <NoteWithLoadedContent rawData={contentQuery.data} slug={slug} />;
}
