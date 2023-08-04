import { useRouter } from "next/router";
import { useNoteContentQuery } from "../../hooks/trpc/use_note_content_query";
import { usePageSlug } from "../../hooks/use_page_id";
import { Spinner } from "../spinner";
import { NoteWithLoadedContent } from "./note_with_loaded_content";

export default function Note() {
	const slug = usePageSlug();
	const router = useRouter();

	const contentQuery = useNoteContentQuery(slug);

	const t = contentQuery.data;

	if (!contentQuery.isSuccess) {
		return <Spinner />;
	}

	const g = contentQuery.data;

	if (!slug) {
		// This should be impossible
		throw new Error("Slug is undefined");
	}

	return (
		<NoteWithLoadedContent
			noteContent={Buffer.from(contentQuery.data)}
			slug={slug}
		/>
	);
}
