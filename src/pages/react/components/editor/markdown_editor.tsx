import Collaboration from "@tiptap/extension-collaboration";
import CollaborationCursor from "@tiptap/extension-collaboration-cursor";
import { BubbleMenu, EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useRef } from "react";
import { createRoot } from "react-dom/client";
import { CustomProvider } from "../../../../../common/yjs/custom_provider";
import { UserPresence } from "../../../../../ws/server/types";
import { Cursor } from "./cursor";
import { EditorButton } from "./buttons/editor_button";
import {
	faBold,
	faCode,
	faCodeBranch,
	faFileCode,
	faItalic,
	faList,
	faQuoteLeft,
	faStrikethrough,
	faUnderline,
} from "@fortawesome/free-solid-svg-icons";
import Underline from "@tiptap/extension-underline";

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
			Underline,
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

	if (!editor) {
		return <></>;
	}

	editor?.isActive("bold");

	return (
		<div className="flex h-full flex-col">
			<BubbleMenu editor={editor}>
				<div className="join overflow-hidden border border-neutral bg-base-300">
					<EditorButton
						editor={editor}
						icon={faBold}
						onClick={(editor) =>
							editor.chain().focus().toggleBold().run()
						}
						label="bold"
					/>
					<EditorButton
						label="italic"
						editor={editor}
						icon={faItalic}
						onClick={(editor) =>
							editor.chain().focus().toggleItalic().run()
						}
					/>
					<EditorButton
						label="underline"
						editor={editor}
						icon={faUnderline}
						onClick={() =>
							editor?.chain().focus().toggleUnderline().run()
						}
					/>
					<EditorButton
						label="blockquote"
						editor={editor}
						icon={faQuoteLeft}
						onClick={() =>
							editor?.chain().focus().toggleBlockquote().run()
						}
					/>
					<EditorButton
						label="bulletlist"
						editor={editor}
						icon={faList}
						onClick={() =>
							editor?.chain().focus().toggleBulletList().run()
						}
					/>
					<EditorButton
						label="code"
						editor={editor}
						icon={faCode}
						onClick={() =>
							editor?.chain().focus().toggleCode().run()
						}
					/>
					<EditorButton
						label="codeblock"
						editor={editor}
						icon={faFileCode}
						onClick={() =>
							editor?.chain().focus().toggleCodeBlock().run()
						}
					/>
					<EditorButton
						label="strike"
						editor={editor}
						icon={faStrikethrough}
						onClick={() =>
							editor?.chain().focus().toggleStrike().run()
						}
					/>
				</div>
			</BubbleMenu>
			<EditorContent
				className="h-full w-full min-w-0 bg-base-100"
				editor={editor}
			/>
		</div>
	);
}
