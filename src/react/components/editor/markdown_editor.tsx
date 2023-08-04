import Collaboration from "@tiptap/extension-collaboration";
import CollaborationCursor from "@tiptap/extension-collaboration-cursor";
import { BubbleMenu, EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useRef } from "react";
import { createRoot } from "react-dom/client";
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
	faTasks,
	faUnderline,
} from "@fortawesome/free-solid-svg-icons";
import Underline from "@tiptap/extension-underline";
import { trpc } from "@/utils/trpc";
import { RouterOutput } from "@/server/routers/_app";
import TaskItem from "@tiptap/extension-task-item";
import TaskList from "@tiptap/extension-task-list";
import { UserPresence } from "../../../../common/ws/types";
import { CustomProvider } from "../../../../common/yjs/custom_provider";

export interface WysiwygEditorProps extends Partial<any> {}

export function WysiwygEditor(props: {
	slug: string;
	setContent: (content: string) => void;
	provider: CustomProvider;
	presences: UserPresence[];
	metadata: RouterOutput["note"]["metadata"];
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
			TaskList,
			TaskItem.configure({
				nested: true,
			}),
		],
	});

	if (!editor) {
		return <></>;
	}

	editor.setEditable(
		props.metadata.allowAnyoneToEdit || props.metadata.isCreatedByYou
	);

	return (
		<div className="flex h-full w-full flex-col">
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
					<EditorButton
						label="tasklist"
						editor={editor}
						icon={faTasks}
						onClick={() =>
							editor?.chain().focus().toggleTaskList().run()
						}
					/>
				</div>
			</BubbleMenu>
			<EditorContent
				className="rounded-box h-full w-full min-w-0 bg-base-100"
				editor={editor}
			/>
		</div>
	);
}
