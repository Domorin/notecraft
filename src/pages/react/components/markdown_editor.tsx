import Collaboration from "@tiptap/extension-collaboration";
import CollaborationCursor from "@tiptap/extension-collaboration-cursor";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useRef } from "react";
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

	const editor = useEditor({
		extensions: [
			StarterKit.configure({
				history: false,
			}),
			Collaboration.configure({
				document: props.provider.doc,
			}),
			CollaborationCursor.configure({
				provider: props.provider,
				user: {
					id: props.provider.doc.clientID,
				},
				render: (user: { id: string }) => {
					const presences = ref.current;

					const userId = user.id;
					const presence = presences.find(
						(val) => val.clientId === Number.parseInt(userId)
					);

					const cursor = document.createElement("span");

					if (!presence) {
						return cursor;
					}

					console.log(user);
					cursor.classList.add(
						"relative",
						"border",
						"ml-[-1px]",
						"mr-[-1px]",
						"pointer-events-none",
						"select-none"
					);
					cursor.style.borderColor = presence.color;

					const root = createRoot(cursor);
					root.render(
						<Cursor color={presence.color} name={presence.name} />
					);

					return cursor;
				},
			}),
		],
	});

	return <EditorContent className="h-full w-full min-w-0" editor={editor} />;
}

function Cursor(props: { name: string; color: string }) {
	// TODO: prevent selection of name
	return (
		<div className="pointer-events-none absolute -top-6 left-[-1px] select-none text-xs">
			<div
				style={{ backgroundColor: props.color }}
				className="rounded-box box-content flex select-none items-center gap-1 whitespace-nowrap rounded-bl-none px-2 py-1 text-primary-content opacity-90"
			>
				<div className="select-none">{props.name}</div>
			</div>
		</div>
	);
}
