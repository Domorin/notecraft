import { useModal } from "@/react/hooks/use_modal";
import { RouterOutput } from "@/server/routers/_app";
import {
	faBold,
	faCode,
	faFileCode,
	faItalic,
	faLink,
	faList,
	faList12,
	faQuoteLeft,
	faStrikethrough,
	faTasks,
	faUnderline,
} from "@fortawesome/free-solid-svg-icons";
import Collaboration from "@tiptap/extension-collaboration";
import CollaborationCursor from "@tiptap/extension-collaboration-cursor";
import Placeholder from "@tiptap/extension-placeholder";
import TaskItem from "@tiptap/extension-task-item";
import TaskList from "@tiptap/extension-task-list";
import Underline from "@tiptap/extension-underline";
import {
	BubbleMenu,
	EditorContent,
	EditorOptions,
	Extension,
	useEditor,
} from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { RefObject, createRef, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { Markdown } from "tiptap-markdown";
import { UserPresence } from "../../../../common/ws/types";
import { CustomProvider } from "../../../../common/yjs/custom_provider";
import { EditorButton } from "./buttons/editor_button";
import { Cursor } from "./cursor";
import { CustomLink } from "./extensions/custom_link_node";
import { baseExtensions } from "./extensions/base_extensions";
import { createHoverExtension } from "./extensions/hover_extension";
import { LinkTooltip } from "./extensions/custom_link_tooltip";
import { set } from "lib0/encoding";
import { Node } from "@tiptap/pm/model";
import { dom } from "lib0";

export function WysiwygEditor(props: {
	slug: string;
	provider: CustomProvider;
	presences: UserPresence[];
	metadata: RouterOutput["note"]["metadata"];
}) {
	const ref = useRef(props.presences);
	const { isOpen, openModal, closeModal } = useModal("EditorLinkInput");

	const [hoveredLinkDom, setHoveredLink] = useState<HTMLAnchorElement | null>(
		null
	);

	if (props.presences !== ref.current) {
		ref.current = props.presences;
	}

	const editor = useEditor({
		extensions: [
			...baseExtensions,
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
			CustomLink.configure({
				toggleModal: (editor) => {
					if (isOpen) {
						closeModal();
						return;
					}
					const { state } = editor;
					const { from, to } = state.selection;
					const text = state.doc.textBetween(from, to, " ");
					openModal({
						initialHref: undefined,
						initialTitle: text,
						onSubmit: editor.commands.createCustomLink,
					});
				},
			}),
			createHoverExtension(setHoveredLink, () => setHoveredLink(null)),
		],
	});

	if (!editor) {
		return <></>;
	}

	editor.setEditable(
		props.metadata.allowAnyoneToEdit || props.metadata.isCreatedByYou
	);

	return (
		<>
			{hoveredLinkDom && (
				<LinkTooltip
					key={hoveredLinkDom.getAttribute("href")!}
					label={hoveredLinkDom.getAttribute("href")!}
					onClick={() => {
						const pos = editor.view.posAtDOM(hoveredLinkDom, 0);
						const tiptapNode = editor.view.state.doc.nodeAt(pos);

						if (!tiptapNode) {
							return;
						}

						openModal({
							initialHref: tiptapNode.attrs.href,
							initialTitle: tiptapNode.attrs.title,
							onSubmit: (opts) =>
								editor
									.chain()
									.focus()
									.deleteRange({
										from: pos,
										to: pos + tiptapNode.nodeSize,
									})
									.createCustomLink(opts)
									.run(),
						});
					}}
					parentRef={hoveredLinkDom}
					onMouseLeave={() => {
						setHoveredLink(null);
					}}
				/>
			)}
			<div className="flex h-full w-full flex-col">
				<BubbleMenu editor={editor}>
					<div className="join overflow-hidden border border-neutral bg-base-300 shadow">
						<EditorButton
							hotkey="ctrl b"
							editor={editor}
							icon={faBold}
							onClick={(editor) => {
								editor.chain().focus().toggleBold().run();
							}}
							label="bold"
						/>
						<EditorButton
							hotkey="ctrl shift X"
							label="italic"
							editor={editor}
							icon={faItalic}
							onClick={(editor) =>
								editor.chain().focus().toggleItalic().run()
							}
						/>
						<EditorButton
							hotkey="ctrl u"
							label="underline"
							editor={editor}
							icon={faUnderline}
							onClick={() =>
								editor?.chain().focus().toggleUnderline().run()
							}
						/>
						<EditorButton
							hotkey="ctrl shift b"
							label="blockquote"
							editor={editor}
							icon={faQuoteLeft}
							onClick={() =>
								editor?.chain().focus().toggleBlockquote().run()
							}
						/>
						<EditorButton
							hotkey="ctrl shift 8"
							label="bulletlist"
							editor={editor}
							icon={faList}
							onClick={() =>
								editor?.chain().focus().toggleBulletList().run()
							}
						/>
						<EditorButton
							hotkey="ctrl shift 8"
							label="orderedlist"
							editor={editor}
							icon={faList12}
							onClick={() =>
								editor
									?.chain()
									.focus()
									.toggleOrderedList()
									.run()
							}
						/>
						<EditorButton
							hotkey="ctrl shift 9"
							label="tasklist"
							editor={editor}
							icon={faTasks}
							onClick={() =>
								editor?.chain().focus().toggleTaskList().run()
							}
						/>
						<EditorButton
							hotkey="ctrl e"
							label="code"
							editor={editor}
							icon={faCode}
							onClick={() =>
								editor?.chain().focus().toggleCode().run()
							}
						/>
						<EditorButton
							hotkey="ctrl alt c"
							label="codeblock"
							editor={editor}
							icon={faFileCode}
							onClick={() =>
								editor?.chain().focus().toggleCodeBlock().run()
							}
						/>
						<EditorButton
							hotkey="ctrl shift x"
							label="strike"
							editor={editor}
							icon={faStrikethrough}
							onClick={() =>
								editor?.chain().focus().toggleStrike().run()
							}
						/>
						<EditorButton
							hotkey="ctrl k"
							label="link"
							editor={editor}
							icon={faLink}
							onClick={(e) => {
								openModal({
									initialHref: undefined,
									initialTitle: undefined,
									onSubmit: editor?.commands.createCustomLink,
								});
							}}
						/>
					</div>
				</BubbleMenu>
				<EditorContent
					className="rounded-box h-full w-full min-w-0 bg-base-100"
					editor={editor}
				/>
			</div>
		</>
	);
}

export function EditorWrapper(props: { children: React.ReactNode }) {
	return <div className="flex h-full w-full flex-col"></div>;
}