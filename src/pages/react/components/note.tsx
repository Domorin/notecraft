import { trpc } from "@/utils/trpc";
import { useEffect, useState } from "react";
import { useSetNoteMetadata } from "../hooks/trpc/use_set_note_metadata";
import { usePageSlug } from "../hooks/use_page_id";
import { Spinner } from "./spinner";
import { TextInput } from "./text_input";

export function LoadableNote() {
	const slug = usePageSlug();

	if (!slug) {
		return <Spinner />;
	}

	return <Note key={slug} slug={slug} />;
}

const useSaveDebounce = (slug: string, value: string, delay: number) => {
	const context = trpc.useContext();
	const setNoteMetadata = useSetNoteMetadata(slug)

	const [lastSaveMs, setLastSaveMs] = useState<number | undefined>(undefined);
	const [savedValue, setSavedValue] = useState(value);


	const saveMutation = trpc.note.save.useMutation({
		onSuccess: (data) => {
			setLastSaveMs(Date.now());
			setSavedValue(data.content);
			setNoteMetadata({ updatedAt: data.updatedAt})
		},
	});

	useEffect(() => {
		if (savedValue === value) {
			return;
		}

		if ((lastSaveMs ?? 0) < Date.now() - 5000) {
			saveMutation.mutate({
				slug,
				text: value,
			});
			return;
		}

		const timer = setTimeout(() => {
			saveMutation.mutate({
				slug,
				text: value,
			});
		}, delay);

		return () => {
			clearTimeout(timer);
		};
	}, [value, delay]);

	return {
		isLoading: saveMutation.isLoading,
	};
};

export function Note(props: { slug: string }) {
	const contentQuery = trpc.note.content.useQuery({ slug: props.slug });
	if (!contentQuery.isSuccess) {
		return <Spinner />;
	}

	return (
		<NoteWithContent
			noteContent={contentQuery.data.content}
			slug={props.slug}
		/>
	);
}

function NoteWithContent(props: { noteContent: string; slug: string }) {
	const { slug, noteContent } = props;

	const context = trpc.useContext();
	const { isLoading } = useSaveDebounce(slug, noteContent, 2000);

	return (
		<div className="flex h-full flex-col">
			<div>isLoading: {isLoading ? "yes" : "no"}</div>
			<TextInput
				initial_text={noteContent}
				setContent={(content) => {
					context.note.content.setData(
						{
							slug: props.slug,
						},
						(data) => ({ content })
					);
				}}
			/>
		</div>
	);
}
