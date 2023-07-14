import type { CustomMessage } from "../../../../ws/ws_server";
import { Remirror, useRemirror } from "@remirror/react";
import { useEffect, useState } from "react";
import { YjsExtension } from "remirror/extensions";
import "remirror/styles/all.css";
import { WebrtcProvider } from "y-webrtc";
import * as Y from "yjs";
import { Spinner } from "./spinner";
import { RouterOutput } from "@/server/routers/_app";
import { useUpdateMetadata } from "../hooks/trpc/use_set_note_metadata";

// https://remirror.io/docs/extensions/yjs-extension/

export function TextInput(props: {
	slug: string;
	doc: Y.Doc;
	setContent: (content: string) => void;
}) {
	const [provider, setProvider] = useState<WebrtcProvider | undefined>(
		undefined
	);

	const [connections, setConnections] = useState(0);

	const setNoteMetadata = useUpdateMetadata(props.slug);

	useEffect(() => {
		const provider = new WebrtcProvider(props.slug, props.doc, {
			signaling: ["ws://localhost:4444"], // TODO: get from environment
		});

		const signalingConn = provider.signalingConns[0];

		signalingConn.on("message", (m: CustomMessage) => {
			switch (m.type) {
				case "connectionMetadata":
					setConnections(m.activeConnections);
					break;
				case "noteMetadataUpdate":
					setNoteMetadata({
						createdAt: m.createdAt,
						updatedAt: m.updatedAt,
						viewedAt: m.viewedAt,
						views: m.views,
					});
					break;
			}
		});

		setProvider(provider);

		return () => {
			props.doc.destroy();
			provider?.destroy();
		};
	}, [props.slug]);

	if (!provider) {
		return <Spinner />;
	}

	return (
		<div className="flex flex-col">
			<div className="flex gap-2">
				<div>{provider.connected ? "Connected" : "Not Connected"}</div>
				<div>Connections: {connections}</div>
			</div>
			<TextInputWithProvider {...props} provider={provider} />
		</div>
	);
}

function TextInputWithProvider(props: {
	slug: string;
	setContent: (content: string) => void;
	provider: WebrtcProvider;
}) {
	const { manager, state } = useRemirror({
		extensions: () => [
			new YjsExtension({
				getProvider: () => props.provider,
				cursorBuilder: (user) => {
					const cursor = document.createElement("span");
					cursor.classList.add("ProseMirror-yjs-cursor");
					cursor.setAttribute("style", `border-color: ${user.color}`);
					const userDiv = document.createElement("div");
					userDiv.setAttribute(
						"style",
						`background-color: ${user.color}`
					);
					userDiv.insertBefore(
						document.createTextNode(user.name + "blargh!"),
						null
					);
					const nonbreakingSpace1 = document.createTextNode("\u2060");
					const nonbreakingSpace2 = document.createTextNode("\u2060");
					cursor.insertBefore(nonbreakingSpace1, null);
					cursor.insertBefore(userDiv, null);
					cursor.insertBefore(nonbreakingSpace2, null);
					return cursor;
				},
			}),
		],
		// Set the initial content.
		// content: props.initial_text,

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
				initialContent={state}
				onChange={(e) => {
					props.setContent(e.state.doc.textContent);
				}}
				classNames={["h-full w-full self-stretch"]}
			/>
		</div>
	);
}
