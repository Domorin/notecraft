import { trpc } from "@/utils/trpc";
import { usePageSlug } from "../../hooks/use_page_id";
import { createErrorMetadata } from "../../utils/error_handler";
import { Spinner } from "../spinner";
import { NoteWithLoadedContent } from "./note_with_loaded_content";

export default function Note() {
	const slug = usePageSlug();

	const contentQuery = trpc.note.content.useQuery(
		{ slug: slug! },
		{
			enabled: !!slug,
			meta: createErrorMetadata({
				type: "ContentLoadFailed",
				errorMessage: "Failed to load note content",
				slug: slug!,
				trigger: ["NOT_FOUND"],
				redirectUrl: "not-found",
			}),
		}
	);

	if (!contentQuery.isSuccess) {
		return <Spinner />;
	}

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
