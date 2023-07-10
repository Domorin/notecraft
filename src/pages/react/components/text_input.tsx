import { Remirror, useRemirror } from "@remirror/react";
import { YjsExtension } from "remirror/extensions";
import * as Y from "yjs";
import "remirror/styles/all.css";
import { WebrtcProvider } from "y-webrtc";

// https://remirror.io/docs/extensions/yjs-extension/
const ydoc = new Y.Doc();
const provider = new WebrtcProvider("remirror-yjs-demo", ydoc, {
	signaling: ["ws://localhost:4444"], // TODO: get from environment
});

export function TextInput(props: {
	initial_text: string;
	setContent: (content: string) => void;
}) {
	const { manager, state } = useRemirror({
		extensions: () => [new YjsExtension({ getProvider: () => provider })],

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
			<Remirror
				manager={manager}
				// initialContent={state}
				// onChange={(e) => {
				// 	props.setContent(e.state.doc.textContent);
				// }}
				// classNames={["h-full w-full self-stretch"]}
			/>
		</div>
	);
}
