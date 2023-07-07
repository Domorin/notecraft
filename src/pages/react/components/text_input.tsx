import { useRemirror } from "@remirror/react";
import "remirror/styles/all.css";
import { Thing } from "./markdown_input";

export function TextInput(props: {
	initial_text: string;
	setContent: (content: string) => void;
}) {
	const { manager, state } = useRemirror({
		extensions: () => [],

		// Set the initial content.
		content: props.initial_text,

		// Place the cursor at the start of the document. This can also be set to
		// `end`, `all` or a numbered position.
		selection: "end",

		// Set the string handler which means the content provided will be
		// automatically handled as html.
		// `markdown` is also available when the `MarkdownExtension`
		// is added to the editor.
		stringHandler: "text",
	});

	return (
		<div className="remirror-theme flex h-full w-full items-stretch">
			<Thing />
		</div>
	);
}
