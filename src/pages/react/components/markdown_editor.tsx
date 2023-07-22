import React, { FC, PropsWithChildren, useCallback, useRef } from "react";
import {
	PlaceholderExtension,
	YjsExtension,
	wysiwygPreset,
} from "remirror/extensions";
import { TableExtension } from "@remirror/extension-react-tables";
import {
	EditorComponent,
	Remirror,
	TableComponents,
	ThemeProvider,
	useRemirror,
} from "@remirror/react";
import { AllStyledComponent } from "@remirror/styles/emotion";
import { createRoot } from "react-dom/client";
import { CustomProvider } from "../../../../common/yjs/custom_provider";
import { UserPresence } from "../../../../ws/server/types";

export interface WysiwygEditorProps extends Partial<any> {}

export function WysiwygEditor(props: {
	slug: string;
	setContent: (content: string) => void;
	provider: CustomProvider;
	presences: UserPresence[];
}) {
	const ref = useRef(props.presences);

	if (props.presences !== ref.current) {
		ref.current = props.presences;
	}

	const extensions = useCallback(
		() => [
			new YjsExtension({
				getProvider: () => props.provider,
				cursorBuilder: (user) => {
					const presences = ref.current;

					const cursor = document.createElement("span");
					const userId = user.name.split(" ")[1];
					const presence = presences.find(
						(val) => val.clientId === Number.parseInt(userId)
					);

					if (!presence) {
						return cursor;
					}

					cursor.classList.add("ProseMirror-yjs-cursor");
					cursor.style.borderColor = presence.color;
					const userDiv = document.createElement("span");

					cursor.insertBefore(userDiv, null);

					const root = createRoot(userDiv);
					root.render(
						<Cursor color={presence.color} name={presence.name} />
					);

					return cursor;
				},
			}),
			new PlaceholderExtension({ placeholder: "PLACEHOLDER!!" }),
			new TableExtension(),
			...wysiwygPreset(),
		],
		[]
	);

	const { manager, state } = useRemirror({ extensions });

	// manager={manager}
	// 			initialContent={state}
	// 			onChange={(e) => {
	// 				props.setContent(e.state.doc.textContent);
	// 			}}
	// 			classNames={["h-full w-full self-stretch"]}

	return (
		<Remirror
			manager={manager}
			initialContent={state}
			onChange={(e) => {
				props.setContent(e.state.doc.textContent);
			}}
			classNames={["h-full w-full self-stretch blargh"]}
		>
			{/* TODO: wtf are these */}
			<EditorComponent />
			<TableComponents />
		</Remirror>
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
