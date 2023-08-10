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
import { Editor as CoreEditor } from "@tiptap/core";
import Collaboration from "@tiptap/extension-collaboration";
import CollaborationCursor from "@tiptap/extension-collaboration-cursor";
import {
	BubbleMenu,
	EditorContent,
	getMarkRange,
	useEditor,
} from "@tiptap/react";
import { useCallback, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { UserPresence } from "../../../../common/ws/types";
import { CustomProvider } from "../../../../common/yjs/custom_provider";
import { EditorButton } from "./buttons/editor_button";
import { Cursor } from "./cursor";
import { baseExtensions } from "./extensions/base_extensions";
import { CustomLink } from "./extensions/custom_link_mark";
import { LinkTooltip } from "./extensions/custom_link_tooltip";
import { createHoverExtension } from "./extensions/hover_extension";

export function getCurrentMark(editor: CoreEditor, name: "customLink") {
	if (!editor.isActive(name)) {
		return;
	}

	const selection = editor.state.selection;

	const node = editor.state.doc.nodeAt(selection.to);

	return node?.marks.find((val) => val.type.name === name);
}

export function WysiwygEditor(props: {
	slug: string;
	provider: CustomProvider;
	presences: UserPresence[];
	metadata: RouterOutput["note"]["metadata"];
}) {
	const ref = useRef(props.presences);
	const { openModal } = useModal("EditorLinkInput");

	const [hoveredLinkDom, setHoveredLink] = useState<HTMLAnchorElement | null>(
		null
	);

	const toggleModal = useCallback(
		(editor: CoreEditor) => {
			// if (isOpen) {
			// 	closeModal();
			// 	return;
			// }
			const { state } = editor;

			const { from, to } = state.selection;

			const currentMark = getCurrentMark(editor, "customLink");

			let initialHref: string;
			let initialTitle: string;
			if (currentMark) {
				const range = getMarkRange(
					editor.state.doc.resolve(from),
					currentMark?.type
				);

				initialHref = currentMark.attrs.href;
				initialTitle = range
					? state.doc.textBetween(range.from, range.to)
					: initialHref;
			} else {
				initialHref = state.doc.textBetween(from, to);
				initialTitle = initialHref;
			}

			openModal({
				initialHref,
				initialTitle,
				onSubmit: editor.commands.setCustomLink,
				onRemove: editor.commands.unsetCustomLink,
			});
		},
		[openModal]
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
				toggleModal,
			}),
			createHoverExtension(setHoveredLink),
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
						const tiptapNode = editor.state.doc.nodeAt(pos);

						if (!tiptapNode) {
							return;
						}

						const mark = tiptapNode.marks.find(
							(val) => val.type.name === "customLink"
						);

						if (!mark) {
							return;
						}

						const range = getMarkRange(
							editor.state.doc.resolve(pos + 1),
							mark.type
						);

						const initialHref = mark.attrs.href;
						const initialTitle = range
							? editor.state.doc.textBetween(range.from, range.to)
							: initialHref;

						openModal({
							initialHref: initialHref,
							initialTitle: initialTitle,
							onSubmit: (opts) =>
								editor
									.chain()
									.focus(pos + 1)
									.setCustomLink(opts)
									.run(),
							onRemove: () => {
								editor
									.chain()
									.focus(pos + 1)
									.unsetCustomLink()
									.run();
							},
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
							title="bold"
						/>
						<EditorButton
							hotkey="ctrl shift X"
							title="italic"
							editor={editor}
							icon={faItalic}
							onClick={(editor) =>
								editor.chain().focus().toggleItalic().run()
							}
						/>
						<EditorButton
							hotkey="ctrl u"
							title="underline"
							editor={editor}
							icon={faUnderline}
							onClick={() =>
								editor?.chain().focus().toggleUnderline().run()
							}
						/>
						<EditorButton
							hotkey="ctrl shift b"
							title="blockquote"
							editor={editor}
							icon={faQuoteLeft}
							onClick={() =>
								editor?.chain().focus().toggleBlockquote().run()
							}
						/>
						<EditorButton
							hotkey="ctrl shift 8"
							title="bulletlist"
							editor={editor}
							icon={faList}
							onClick={() =>
								editor?.chain().focus().toggleBulletList().run()
							}
						/>
						<EditorButton
							hotkey="ctrl shift 8"
							title="orderedlist"
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
							title="tasklist"
							editor={editor}
							icon={faTasks}
							onClick={() =>
								editor?.chain().focus().toggleTaskList().run()
							}
						/>
						<EditorButton
							hotkey="ctrl e"
							title="code"
							editor={editor}
							icon={faCode}
							onClick={() =>
								editor?.chain().focus().toggleCode().run()
							}
						/>
						<EditorButton
							hotkey="ctrl alt c"
							title="codeblock"
							editor={editor}
							icon={faFileCode}
							onClick={() =>
								editor?.chain().focus().toggleCodeBlock().run()
							}
						/>
						<EditorButton
							hotkey="ctrl shift x"
							title="strike"
							editor={editor}
							icon={faStrikethrough}
							onClick={() =>
								editor?.chain().focus().toggleStrike().run()
							}
						/>
						<EditorButton
							hotkey="ctrl k"
							title="link"
							markNameOverride="customLink"
							editor={editor}
							icon={faLink}
							onClick={() => toggleModal(editor)}
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
