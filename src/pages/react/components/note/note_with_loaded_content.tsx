import { trpc } from "@/utils/trpc";
import { useEffect, useRef } from "react";
import * as Y from "yjs";
import { TextInput } from "../editor/text_input";
import { encodeYDocContent, parseYDocContent } from "@/lib/ydoc_utils";
import { useNoteListRecent } from "../../hooks/use_recent_local_storage";
import { NoteEditDisplaySuspense } from "./note_edit_display";
import debounce from "lodash.debounce";

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

export const debouncedSaveContent = debounce(saveContent, 2000, {
	maxWait: 5000,
});

export function NoteWithLoadedContent(props: {
	noteContent: Buffer;
	slug: string;
}) {
	const { slug, noteContent } = props;

	const { add } = useNoteListRecent();
	useEffect(() => {
		add(slug);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const doc = useRef(parseYDocContent(noteContent));

	const saveMutation = trpc.note.save.useMutation();

	useEffect(() => {
		doc.current.on(
			"update",
			(update: Uint8Array, origin: any, doc: Y.Doc) => {
				debouncedSaveContent(saveMutation, slug, doc);
			}
		);
	}, [saveMutation, slug]);

	return (
		<div className="flex h-full w-full flex-col">
			<TextInput
				key={props.slug}
				slug={props.slug}
				doc={doc.current}
				setContent={(content) => {
					// context.note.content.setData(
					// 	{
					// 		slug: props.slug,
					// 	},
					// 	(data) => ({ content })
					// );
				}}
			/>
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
