import { trpc } from "@/utils/trpc";
import { DateTime } from "luxon";
import { useEffect, useRef, useState } from "react";
import { useUpdateMetadata } from "../hooks/trpc/use_set_note_metadata";
import { usePageSlug } from "../hooks/use_page_id";
import { DefaultSuspense } from "./default_suspense";
import { Spinner } from "./spinner";
import { TextInput } from "./text_input";
import { RouterOutput } from "@/server/routers/_app";
import { parseYDocContent } from "@/common/ydoc_utils";

export function LoadableNote() {
	const slug = usePageSlug();

	if (!slug) {
		return <Spinner />;
	}

	return <Note key={slug} slug={slug} />;
}

// const useSaveDebounce = (slug: string, value: string, delay: number) => {
// 	const setNoteMetadata = useUpdateMetadata(slug);

// 	const [lastSaveMs, setLastSaveMs] = useState<number | undefined>(undefined);
// 	const [savedValue, setSavedValue] = useState(value);

// 	const saveMutation = trpc.note.save.useMutation({
// 		onSuccess: (data) => {
// 			setLastSaveMs(Date.now());
// 			setSavedValue(data.content);
// 			setNoteMetadata({ updatedAt: data.updatedAt });
// 		},
// 	});

// 	const componentWillUnmount = useRef(false);

// 	useEffect(
// 		() => () => {
// 			componentWillUnmount.current = true;
// 		},
// 		[]
// 	);

// 	useEffect(() => {
// 		if (savedValue === value) {
// 			return;
// 		}

// 		if ((lastSaveMs ?? 0) < Date.now() - 5000) {
// 			saveMutation.mutate({
// 				slug,
// 				text: value,
// 			});
// 			return;
// 		}

// 		const timer = setTimeout(() => {
// 			saveMutation.mutate({
// 				slug,
// 				text: value,
// 			});
// 		}, delay);

// 		return () => {
// 			clearTimeout(timer);
// 		};
// 	}, [value, delay]);

// 	useEffect(
// 		() => () => {
// 			// Hacky way to save the text when this component is unmounted
// 			if (componentWillUnmount.current && savedValue !== value) {
// 				saveMutation.mutate({
// 					slug,
// 					text: value,
// 				});
// 			}
// 		},
// 		[value]
// 	);

// 	return {
// 		savedValue,
// 		isLoading: saveMutation.isLoading,
// 	};
// };

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

function NoteWithContent(props: { noteContent: Buffer; slug: string }) {
	const { slug, noteContent } = props;

	const context = trpc.useContext();
	// const { isLoading } = useSaveDebounce(slug, noteContent, 2000);

	return (
		<div className="flex h-full flex-col">
			<TextInput
				key={props.slug}
				slug={props.slug}
				doc={parseYDocContent(props.noteContent)}
				setContent={(content) => {
					// context.note.content.setData(
					// 	{
					// 		slug: props.slug,
					// 	},
					// 	(data) => ({ content })
					// );
				}}
			/>
			<NoteEditDisplaySuspense slug={props.slug} isSaving={false} />
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
