import React, { useEffect, useRef, useState } from "react";
import { WebrtcProvider } from "y-webrtc";
import * as Y from "yjs";
import { Spinner } from "../spinner";
import { RouterOutput } from "@/server/routers/_app";
import { useUpdateMetadata } from "../../hooks/trpc/use_update_metadata";
import ReactDOM from "react-dom";
import { createRoot } from "react-dom/client";
import { WebsocketProvider } from "y-websocket";
import { CustomAwareness } from "../../../../../common/yjs/custom_awareness";
import { CustomProvider } from "../../../../../common/yjs/custom_provider";
import type {
	CustomMessage,
	UserPresence,
} from "../../../../../ws/server/types";
import classNames from "classnames";
import { WysiwygEditor } from "./markdown_editor";

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
		const provider = new CustomProvider(
			"ws://localhost:4444",
			props.slug,
			props.doc,
			{
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
								title: m.title,
							});
							break;
					}
				},
			}
		);
		setProvider(provider);

		return () => {
			props.doc.destroy();
			provider?.destroy();
		};
	}, [props.doc, props.slug, setNoteMetadata]);

	if (!provider) {
		return <Spinner />;
	}


	return (
		<div className="flex h-full w-full flex-col">
			{/* <TextInputWithProvider
				{...props}
				provider={provider}
				presences={presences}
			/> */}
			<div className="relative">
				<div className="presence absolute right-0 z-10 m-4 opacity-25 transition-all hover:opacity-100">
					<Presences
						presences={presences}
						clientId={props.doc.clientID}
					/>
				</div>
			</div>
			<WysiwygEditor
				{...props}
				provider={provider}
				presences={presences}
			/>
		</div>
	);
}

function Presences(props: { presences: UserPresence[]; clientId: number }) {
	return (
		<div className="avatar-group -space-x-3 overflow-visible">
			{props.presences
				.map((val) => <UserPresence key={val.name} user={val} />)
				.slice(0, 5)}
			{props.presences.length > 5 && (
				<Presence name={`+${props.presences.length - 5}`} />
			)}
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
				style={
					props.color ? { backgroundColor: props.color } : undefined
				}
			>
				<span className="text-sm font-bold text-white">
					{props.name}
				</span>
			</div>
		</div>
	);
}

function UserPresence(props: { user: UserPresence }) {
	const letters = props.user.name.split(" ").map((val) => val[0]);

	return (
		<Presence
			name={letters.join("")}
			color={props.user.color}
			tooltip={props.user.name}
		/>
	);
}
