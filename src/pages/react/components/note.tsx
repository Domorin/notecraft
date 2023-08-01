import { trpc } from "@/utils/trpc";
import debounce from "lodash.debounce";
import { DateTime } from "luxon";
import { useEffect, useRef, useState } from "react";
import * as Y from "yjs";
import { usePageSlug } from "../hooks/use_page_id";
import { DefaultSuspense } from "./default_suspense";
import { Spinner } from "./spinner";
import { TextInput } from "./editor/text_input";
import { encodeYDocContent, parseYDocContent } from "@/lib/ydoc_utils";
import { useNoteListRecent } from "../hooks/use_recent_local_storage";

export function LoadableNote() {
	const slug = usePageSlug();

	if (!slug) {
		return <Spinner />;
	}

	return <Note key={slug} slug={slug} />;
}

export function Note(props: { slug: string }) {
	const contentQuery = trpc.note.content.useQuery({ slug: props.slug });

	if (!contentQuery.isSuccess) {
		return <Spinner />;
	}

	return (
		<NoteWithContent
			noteContent={Buffer.from(contentQuery.data.data)}
			slug={props.slug}
		/>
	);
}

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

const debouncedSaveContent = debounce(saveContent, 2000);

function NoteWithContent(props: { noteContent: Buffer; slug: string }) {
	const { slug, noteContent } = props;

	const [_, setRecent] = useNoteListRecent();
	useEffect(() => {
		setRecent(slug);
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
				<div className="r-0 absolute flex w-full">
					<NoteEditDisplaySuspense
						slug={props.slug}
						isSaving={saveMutation.isLoading}
					/>
				</div>
			</div>
		</div>
	);
}

function NoteEditDisplaySuspense(props: { slug: string; isSaving: boolean }) {
	return (
		<DefaultSuspense>
			<NoteEditDisplay {...props} />
		</DefaultSuspense>
	);
}

function NoteEditDisplay(props: { slug: string; isSaving: boolean }) {
	const [metadata, status] = trpc.note.metadata.useSuspenseQuery({
		slug: props.slug,
	});

	const updatedAt = DateTime.fromISO(metadata.updatedAt);
	const [dateText, setDateText] = useState(updatedAt.toRelative());

	useEffect(() => {
		setDateText(updatedAt.toRelative());
		const timer = setInterval(
			() => setDateText(updatedAt.toRelative()),
			1000
		);

		return () => clearInterval(timer);
	}, [props.isSaving, updatedAt]);

	return (
		<div className="ml-auto flex gap-2 text-sm opacity-50">
			<div>{props.isSaving ? "Saving..." : `Saved ${dateText}`}</div>
			<div>{metadata.views} Views</div>
		</div>
	);
}
