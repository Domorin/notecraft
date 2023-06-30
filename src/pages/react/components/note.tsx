import { trpc } from "@/utils/trpc";
import { Suspense, useEffect, useRef, useState } from "react";
import { usePageSlug } from "../hooks/use_page_id";
import { TextInput } from "./text_input";
import { useHelpers } from "@remirror/react";
import { Spinner } from "./spinner";
import { useRouter } from "next/router";
import { MutationButton } from "./load_button";

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
	const context = trpc.useContext();

	const saveMutation = trpc.savePage.useMutation();

	const [page, query] = trpc.getPage.useSuspenseQuery({
		slug: props.slug,
	});

	if (!page) {
		return <div>Page not found</div>;
	}

	return (
		<div className="flex h-full flex-col">
			<TextInput
				initial_text={page.content}
				setContent={(content) => {
					context.getPage.setData(
						{
							slug: props.slug,
						},
						(data) => (data ? { ...data, content } : data)
					);
				}}
			/>
			<div className="ml-auto justify-self-end">
				<MutationButton
					onClick={() => {
						saveMutation.mutate({
							text:
								context.getPage.getData({ slug: props.slug })
									?.content ?? "",
							slug: props.slug,
						});
					}}
					isLoading={saveMutation.isLoading}
				>
					Save
				</MutationButton>
			</div>
		</div>
	);
}
