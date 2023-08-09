import { encodeYDocContent, parseYDocContent } from "@/lib/ydoc_utils";
import { useNoteContentQuery } from "@/react/hooks/trpc/use_note_content_query";
import { trpc } from "@/utils/trpc";
import debounce from "lodash.debounce";
import { useCallback, useEffect, useMemo, useRef } from "react";
import * as Y from "yjs";
import { useNoteListRecent } from "../../hooks/use_recents";
import { TextInput } from "../editor/text_input";
import { NoteEditDisplaySuspense } from "./note_edit_display";

function saveContent(
	mutate: ReturnType<typeof trpc.note.save.useMutation>["mutate"],
	slug: string,
	doc: Y.Doc
) {
	mutate({
		slug,
		content: Array.from(encodeYDocContent(doc)),
	});
}

export const debouncedSaveContent = debounce(saveContent, 1000, {
	maxWait: 5000,
});

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

	const saveMutation = trpc.note.save.useMutation();
	const save = useCallback(() => {
		debouncedSaveContent(saveMutation.mutate, slug, doc);
	}, [doc, saveMutation.mutate, slug]);

	return (
		<div className="flex h-full w-full flex-col">
			<TextInput
				key={props.slug}
				slug={props.slug}
				doc={doc}
				save={save}
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
