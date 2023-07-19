import { I18nProvider, Remirror, useRemirror } from "@remirror/react";
import React, { useEffect, useRef, useState } from "react";
import { YjsExtension } from "remirror/extensions";
import "remirror/styles/all.css";
import { WebrtcProvider } from "y-webrtc";
import * as Y from "yjs";
import { Spinner } from "./spinner";
import { RouterOutput } from "@/server/routers/_app";
import { useUpdateMetadata } from "../hooks/trpc/use_update_metadata";
import ReactDOM from "react-dom";
import { createRoot } from "react-dom/client";
import { WebsocketProvider } from "y-websocket";
import { CustomAwareness } from "../../../../common/yjs/custom_awareness";
import { CustomProvider } from "../../../../common/yjs/custom_provider";
import type { CustomMessage, UserPresence } from "../../../../ws/server/types";
import classNames from "classnames";

// https://remirror.io/docs/extensions/yjs-extension/

export function TextInput(props: {
	slug: string;
	doc: Y.Doc;
	setContent: (content: string) => void;
}) {
	const [provider, setProvider] = useState<CustomProvider | undefined>(
		undefined
	);
	const [presences, setPresences] = useState([] as UserPresence[]);
	const setNoteMetadata = useUpdateMetadata(props.slug);

	useEffect(() => {
		const provider = new CustomProvider("ws://localhost:4444", props.slug, props.doc, {
			disableBc: true,
			customMessageHandler: (m: CustomMessage) => {
				switch (m.type) {
					case "presencesUpdated":
						setPresences(m.users);
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
			}

		});
		setProvider(provider);


		return () => {
			props.doc.destroy();
			provider?.destroy();
		};
	}, [props.doc, props.slug]);


	if (!provider) {
		return <Spinner />;
	}


	return (
		<div className="flex flex-col">
			<div className="flex gap-2">
				<div className="ml-auto">
					<Presences presences={presences} />
				</div>
			</div>
			<TextInputWithProvider {...props} provider={provider} presences={presences} />
		</div>
	);
}



function Presences(props: { presences: UserPresence[] }) {

	return (
		<div className="avatar-group -space-x-3 overflow-visible">
			{props.presences.map((val) => (
				<UserPresence key={val.name} user={val} />
			)).slice(0, 5)}
			{props.presences.length > 5 && <Presence name={`+${props.presences.length - 5}`}
			/>}
		</div>
	);
}

function Presence(props: {
	name: string;
	tooltip?: string;
	color?: string;
	className?: string;
}) {
	return (
		<div
			className="placeholder avatar tooltip overflow-visible border-2 border-neutral-focus"
			data-tip={props.tooltip}
		>
			<div
				className={classNames("w-8 overflow-hidden rounded-full", {
					"bg-neutral text-neutral-content": !props.color,
				})}
				style={props.color ? { backgroundColor: props.color } : undefined}
			>
				<span className="text-sm font-bold text-white">{props.name}</span>
			</div>
		</div>
	);
}

function UserPresence(props: { user: UserPresence }) {
	const letters = props.user.name.split(" ").map((val) => val[0]);

	return <Presence name={letters.join("")} color={props.user.color} tooltip={props.user.name} />
}

function TextInputWithProvider(props: {
	slug: string;
	setContent: (content: string) => void;
	provider: CustomProvider;
	presences: UserPresence[];
}) {

	// This needs to be a ref so cursorBuilder gets the correct value
	const ref = useRef(props.presences);

	if (props.presences !== ref.current) {
		ref.current = props.presences;
	}


	const { manager, state } = useRemirror({
		extensions: () => [
			new YjsExtension({
				getProvider: () => props.provider,
				cursorBuilder: (user) => {
					const presences = ref.current;

					const cursor = document.createElement("span");
					const userId = user.name.split(" ")[1];
					const presence = presences.find((val) => val.clientId === Number.parseInt(userId));

					if (!presence) {
						return cursor;
					}


					cursor.classList.add("ProseMirror-yjs-cursor");
					cursor.style.borderColor = presence.color;
					const userDiv = document.createElement("span");

					cursor.insertBefore(userDiv, null);

					const root = createRoot(userDiv);
					root.render(<Cursor color={presence.color} name={presence.name} />);

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

	// TODO: prevent selection of name
	return (
		<div className="pointer-events-none absolute">
			<div className="relative top-4 text-xs">
				<div className="rounded-box flex items-center gap-1 whitespace-nowrap bg-primary px-2 py-1 text-primary-content opacity-90">
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
