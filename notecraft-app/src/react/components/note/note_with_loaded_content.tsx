import { useNoteContentQuery } from "@/react/hooks/trpc/use_note_content_query";
import { useEffect, useMemo, useRef } from "react";
import { Doc } from "yjs";
import { useNoteListRecent } from "../../hooks/use_recents";
import { NoteView } from "../editor/note_view";
import { NoteEditDisplaySuspense } from "./note_edit_display";
import { trpc } from "@/utils/trpc";

export function NoteWithLoadedContent(props: {
	rawData: NonNullable<ReturnType<typeof useNoteContentQuery>["data"]>;
	slug: string;
}) {
	// Memoize this call so it is not called every render
	const memoizedDoc = useMemo(() => new Doc(), []);
	// We still want it in a ref to ensure it is not deleted by react (since memo cant be trusted)
	const doc = useRef(memoizedDoc).current;

	const { slug } = props;

	const { add } = useNoteListRecent();

	const addViewMutation = trpc.note.addView.useMutation().mutate;

	useEffect(() => {
		addViewMutation({
			slug,
		});
	}, [addViewMutation, slug]);

	useEffect(() => {
		// Add page to recents
		add(slug);
	}, [add, slug]);

	return (
		<div className="flex h-full w-full flex-col gap-1">
			<NoteView key={props.slug} slug={props.slug} doc={doc} />
			<div className="relative w-full">
				<div className="absolute flex w-full">
					<NoteEditDisplaySuspense slug={props.slug} />
				</div>
			</div>
		</div>
	);
}
