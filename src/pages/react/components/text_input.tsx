import { Remirror, useRemirror } from "@remirror/react";
import { YjsExtension } from "remirror/extensions";
import * as Y from "yjs";
import "remirror/styles/all.css";
import { WebrtcProvider } from "y-webrtc";
import { useEffect, useRef, useState } from "react";
import { usePageSlug } from "../hooks/use_page_id";
import { Spinner } from "./spinner";

// https://remirror.io/docs/extensions/yjs-extension/
const ydoc = new Y.Doc();

export function TextInput(props: {
	slug: string;
	initial_text: string;
	setContent: (content: string) => void;
}) {
	const [provider, setProvider] = useState<WebrtcProvider | undefined>(
		undefined
	);

	const [isConnected, setIsConnected] = useState(false);
	const [connections, setConnections] = useState(0);
	const [bcConnections, setBcConnections] = useState(0);

	useEffect(() => {
		const provider = new WebrtcProvider(props.slug, ydoc, {
			signaling: ["ws://localhost:4444"], // TODO: get from environment
		});

		provider.room?.webrtcConns.size;
		const interval = setInterval(() => {
			setBcConnections(provider.room?.bcConns.size || 0);
			setIsConnected(provider.connected);
			setConnections(provider.room?.webrtcConns.size || 0);
		}, 1000);
		// provider.signalingConns.forEach((val) =>
		// 	val.on("message", (m) => console.log("got message", m))
		// );

		setProvider(provider);

		return () => {
			ydoc.destroy();
			provider?.disconnect();
			clearInterval(interval);
		};
	}, [props.slug]);

	if (!provider) {
		return <Spinner />;
	}

	return (
		<div className="flex flex-col">
			<div className="flex gap-2">
				<div>{isConnected ? "Connected" : "Not Connected"}</div>
				<div>Connections: {connections}</div>
				<div>BcConnections: {bcConnections}</div>
			</div>
			<TextInputWithProvider {...props} provider={provider} />
		</div>
	);
}

function TextInputWithProvider(props: {
	slug: string;
	initial_text: string;
	setContent: (content: string) => void;
	provider: WebrtcProvider;
}) {
	const { manager, state } = useRemirror({
		extensions: () => [
			new YjsExtension({ getProvider: () => props.provider }),
		],
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
				initialContent={state}
				onChange={(e) => {
					props.setContent(e.state.doc.textContent);
				}}
				classNames={["h-full w-full self-stretch"]}
			/>
		</div>
	);
}
