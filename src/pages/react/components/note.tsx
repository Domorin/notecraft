import { trpc } from "@/utils/trpc";
import { Suspense, useEffect, useRef, useState } from "react";
import { usePageSlug } from "../hooks/use_page_id";
import { TextInput } from "./text_input";
import { useHelpers } from "@remirror/react";
import { Spinner } from "./spinner";
import { useRouter } from "next/router";

export function LoadableNote() {
	const slug = usePageSlug();

	if (!slug) {
		return <Spinner />;
	}

	return (
		<Suspense fallback={<Spinner />}>
			<Note key={slug} slug={slug} />
		</Suspense>
	);
}

export function Note(props: { slug: string }) {
	const saveMutation = trpc.savePage.useMutation({
		onSuccess: (data) => {},
	});

	const [page, query] = trpc.getPage.useSuspenseQuery({
		slug: props.slug,
	});

	const currentContent = useRef(page?.content ?? "");

	if (!page) {
		return <div>Page not found</div>;
	}

	return (
		<div className="flex h-full flex-col">
			<TextInput
				initial_text={page.content}
				setContent={(content) => (currentContent.current = content)}
			/>
			<div className="ml-auto justify-self-end">
				<button
					onClick={() => {
						saveMutation.mutate({
							text: currentContent.current,
							slug: props.slug,
						});
					}}
					className="btn-primary btn bg-black"
				>
					Save
				</button>
			</div>
		</div>
	);
}
