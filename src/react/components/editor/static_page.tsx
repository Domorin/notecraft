import { generateHTML } from "@tiptap/html";
import { yDocToProsemirrorJSON } from "y-prosemirror";
import { baseExtensions } from "./extensions/base_extensions";
import { CustomLink } from "./extensions/custom_link_node";
import { Doc } from "yjs";
import { useEffect, useMemo } from "react";

export function StaticNote(props: { doc: Doc }) {
	const f = useMemo(
		() => yDocToProsemirrorJSON(props.doc, "default"),
		[props.doc]
	);
	const html = useMemo(
		() => generateHTML(f, [...baseExtensions, CustomLink]),
		[props.doc]
	);

	useEffect(() => {
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
	});

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
