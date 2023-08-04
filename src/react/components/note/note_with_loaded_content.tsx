import { encodeYDocContent, parseYDocContent } from "@/lib/ydoc_utils";
import { trpc } from "@/utils/trpc";
import debounce from "lodash.debounce";
import { useEffect, useRef } from "react";
import * as Y from "yjs";
import { useNoteListRecent } from "../../hooks/use_recents";
import { TextInput } from "../editor/text_input";
import { NoteEditDisplaySuspense } from "./note_edit_display";

function saveContent(
	mutation: ReturnType<typeof trpc.note.save.useMutation>,
	slug: string,
	doc: Y.Doc
) {
	mutation.mutate({
		slug,
		content: Array.from(encodeYDocContent(doc)),
	});
}

export const debouncedSaveContent = debounce(saveContent, 1000, {
	maxWait: 5000,
});

export function NoteWithLoadedContent(props: {
	noteContent: Buffer;
	slug: string;
}) {
	const { slug, noteContent } = props;

	const { add } = useNoteListRecent();

	const doc = useRef(parseYDocContent(noteContent));

	useEffect(() => {
		// Add page to recents
		add(slug);
	}, [add, slug]);

	const saveMutation = trpc.note.save.useMutation();

	useEffect(() => {
		doc.current.on(
			"update",
			(_update: Uint8Array, _origin: unknown, doc: Y.Doc) => {
				debouncedSaveContent(saveMutation, slug, doc);
			}
		);
	}, [saveMutation, slug]);

	return (
		<div className="flex h-full w-full flex-col">
			<TextInput key={props.slug} slug={props.slug} doc={doc.current} />
			<div className="relative w-full">
				<div className="absolute flex w-full">
					<NoteEditDisplaySuspense
						slug={props.slug}
						isSaving={saveMutation.isLoading}
					/>
				</div>
			</div>
		</div>
	);
}
