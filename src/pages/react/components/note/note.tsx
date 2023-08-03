import { trpc } from "@/utils/trpc";
import { usePageSlug } from "../../hooks/use_page_id";
import { createErrorMetadata } from "../../utils/error_handler";
import { Spinner } from "../spinner";
import { NoteWithLoadedContent } from "./note_with_loaded_content";
import { useRouter } from "next/router";
import { ReactQueryDevtoolsPanel } from "@tanstack/react-query-devtools";
import { useEffect } from "react";
import { RouterOutput } from "@/server/routers/_app";
import { isError } from "@tanstack/react-query";
import { useNoteContentQuery } from "../../hooks/trpc/use_note_content_query";

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
