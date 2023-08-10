import { parseYDocContent } from "@/lib/ydoc_utils";
import { useNoteContentQuery } from "@/react/hooks/trpc/use_note_content_query";
import { useEffect, useMemo, useRef } from "react";
import { useNoteListRecent } from "../../hooks/use_recents";
import { TextInput } from "../editor/text_input";
import { NoteEditDisplaySuspense } from "./note_edit_display";

function createDoc(data: number[]) {
	return parseYDocContent(Buffer.from(data));
}

export function NoteWithLoadedContent(props: {
	rawData: NonNullable<ReturnType<typeof useNoteContentQuery>["data"]>;
	slug: string;
}) {
	// Memoize this call so it is not called every render
	const memoizedDoc = useMemo(
		() => createDoc(props.rawData),
		[props.rawData]
	);

	const doc = useRef(memoizedDoc).current;

	const { slug } = props;

	const { add } = useNoteListRecent();

	useEffect(() => {
		// Add page to recents
		add(slug);
	}, [add, slug]);

	return (
		<div className="flex h-full w-full flex-col">
			<TextInput key={props.slug} slug={props.slug} doc={doc} />
			<div className="relative w-full">
				<div className="absolute flex w-full">
					<NoteEditDisplaySuspense slug={props.slug} />
				</div>
			</div>
		</div>
	);
}
