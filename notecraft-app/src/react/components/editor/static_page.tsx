import { useNoteContentQuery } from "@/react/hooks/trpc/use_note_content_query";
import { generateHTML } from "@tiptap/html";
import { useEffect, useMemo } from "react";
import { Spinner } from "../spinner";
import { baseExtensions } from "./extensions/base_extensions";
import { CustomLink } from "./extensions/custom_link_mark";
import { NotecraftImage } from "./extensions/image/notecraft_image";

export function StaticNote(props: { slug: string }) {
	const query = useNoteContentQuery(props.slug);

	const html = useMemo(() => {
		if (!query.data) {
			return;
		}

		return generateHTML(query.data.docJson, [
			...baseExtensions,
			CustomLink,
			NotecraftImage,
		]);
	}, [query.data]);

	useEffect(() => {
		if (html == undefined) {
			return;
		}

		const parentElement = document.querySelector(".ProseMirror");

		if (parentElement) {
			// Find all input elements within the parent element
			const inputElements = parentElement.querySelectorAll("input");

			// Loop through the input elements and do something with them
			inputElements.forEach((input) => {
				input.classList.add("static-checkbox");
				input.setAttribute("disabled", "true");
			});
		} else {
			console.error('Parent element with class "ProseMirror" not found.');
		}
	}, [html]);

	// HTML can be an empty string, if it is an empty string, we still want to render
	if (html == undefined) {
		return <Spinner />;
	}

	return (
		<div className="relative flex h-full w-full flex-col">
			<div
				className="ProseMirror"
				tabIndex={0}
				translate="no"
				dangerouslySetInnerHTML={{ __html: html }}
			></div>
		</div>
	);
}
