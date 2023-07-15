import type { CustomMessage } from "../../../../ws/ws_server";
import { I18nProvider, Remirror, useRemirror } from "@remirror/react";
import React, { useEffect, useState } from "react";
import { YjsExtension } from "remirror/extensions";
import "remirror/styles/all.css";
import { WebrtcProvider } from "y-webrtc";
import * as Y from "yjs";
import { Spinner } from "./spinner";
import { RouterOutput } from "@/server/routers/_app";
import { useUpdateMetadata } from "../hooks/trpc/use_set_note_metadata";
import ReactDOM from "react-dom";
import { createRoot } from "react-dom/client";

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
		console.log("new provider!");
		const provider = new WebrtcProvider(props.slug, props.doc, {
			signaling: ["ws://localhost:4444"], // TODO: get from environment
		});

		const signalingConn = provider.signalingConns[0];

		signalingConn.on("message", (m: CustomMessage) => {
			switch (m.type) {
				case "createUser":
					provider.awareness.setLocalStateField("user", {
						name: m.name,
						color: m.color,
					});
					break;
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
				<div className="ml-auto">
					<Presences provider={provider} />
				</div>
			</div>
			<TextInputWithProvider {...props} provider={provider} />
		</div>
	);
}

type User = {
	name: string;
	color: string;
};

type AwarenessState = { user?: User };

function Presences(props: { provider: WebrtcProvider }) {
	const [states, setStates] = useState([
		...props.provider.awareness.getStates().values(),
	] as AwarenessState[]);

	useEffect(() => {
		props.provider.awareness.on("change", () => {
			setStates([
				...props.provider.awareness.getStates().values(),
			] as AwarenessState[]);
		});
	});

	return (
		<div className="avatar-group -space-x-3 overflow-visible">
			{states
				.filter((val) => "user" in val)
				.map((val) => (
					<Presence key={val.user?.name} user={val.user as User} />
				))}
		</div>
	);
}

function Presence(props: { user: User }) {
	const letters = props.user.name.split(" ").map((val) => val[0]);

	// TODO: fix colors
	return (
		<div
			className="placeholder avatar tooltip overflow-visible border-2 border-neutral-focus"
			data-tip={props.user.name}
		>
			<div
				className="w-8 overflow-hidden rounded-full"
				style={{ backgroundColor: props.user.color }}
			>
				<span className="text-sm font-bold">{letters.join("")}</span>
			</div>
		</div>
	);

	// <div className="avatar-group -space-x-6">
	// 	<div className="avatar">
	// 		<div className="w-12">
	// 			<img src="/images/stock/photo-1534528741775-53994a69daeb.jpg" />
	// 		</div>
	// 	</div>
	// 	<div className="avatar">
	// 		<div className="w-12">
	// 			<img src="/images/stock/photo-1534528741775-53994a69daeb.jpg" />
	// 		</div>
	// 	</div>
	// 	<div className="avatar">
	// 		<div className="w-12">
	// 			<img src="/images/stock/photo-1534528741775-53994a69daeb.jpg" />
	// 		</div>
	// 	</div>
	// 	<div className="placeholder avatar">
	// 		<div className="w-12 bg-neutral-focus text-neutral-content">
	// 			<span>+99</span>
	// 		</div>
	// 	</div>
	// </div>;

	return (
		<div className="flex items-center gap-2">
			<div
				className="h-2 w-2 rounded-full border border-primary-content"
				style={{ backgroundColor: props.user.color }}
			></div>
			<div>{props.user.name}</div>
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
					cursor.style.borderColor = user.color;
					const userDiv = document.createElement("span");

					cursor.insertBefore(userDiv, null);

					const root = createRoot(userDiv);
					root.render(<Cursor color={user.color} name={user.name} />);

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

function Cursor(props: { name: string; color: string }) {
	return (
		<div className="pointer-events-none absolute">
			<div className="relative top-4 text-xs">
				<div className="rounded-box flex items-center gap-1 whitespace-nowrap bg-primary px-2 py-1 text-primary-content opacity-75	">
					<div
						className="h-2 w-2 rounded-full border border-primary-content"
						style={{ backgroundColor: props.color }}
					></div>
					<div>{props.name}</div>
				</div>
			</div>
		</div>
	);
}
