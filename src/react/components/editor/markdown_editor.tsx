import { useModal } from "@/react/hooks/use_modal";
import { RouterOutput } from "@/server/routers/_app";
import { Editor as CoreEditor } from "@tiptap/core";
import Collaboration from "@tiptap/extension-collaboration";
import CollaborationCursor from "@tiptap/extension-collaboration-cursor";
import { EditorContent, getMarkRange, useEditor } from "@tiptap/react";
import { useCallback, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { UserPresence } from "../../../../common/ws/types";
import { CustomProvider } from "../../../../common/yjs/custom_provider";
import { Cursor } from "./cursor";
import getSuggestionItems from "./extensions/autocomplete/autocomplete_items";
import Commands, {
	AutocompleteCommandProps,
	CommandSuggestionProps,
} from "./extensions/autocomplete/autocomplete_extension";
import renderItems from "./extensions/autocomplete/autocomplete_render_items";
import { baseExtensions } from "./extensions/base_extensions";
import { CustomLink } from "./extensions/custom_link_mark";
import { createHoverExtension } from "./extensions/hover_extension";
import { StaticNote } from "./static_page";
import { EditorMenu } from "./editor_menu";
import { EditorLinkTooltip } from "./editor_link_tooltip";
import AutocompleteCommandsList from "./extensions/autocomplete/autocomplete_commands_list";

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

	const [showingAutocomplete, setShowingAutocomplete] =
		useState<CommandSuggestionProps | null>(null);

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
			Commands.configure({
				suggestion: {
					items: getSuggestionItems,
					render: renderItems,
				},
				showMenu: (bool) => {
					setShowingAutocomplete(bool);
				},
			}),
		],
	});

	if (!editor) {
		return <StaticNote />;
	}

	editor.setEditable(
		props.metadata.allowAnyoneToEdit || props.metadata.isCreatedByYou
	);

	return (
		<>
			{showingAutocomplete && (
				<AutocompleteCommandsList
					{...showingAutocomplete}
					close={() => setShowingAutocomplete(null)}
				/>
			)}
			{hoveredLinkDom && (
				<EditorLinkTooltip
					editor={editor}
					hoveredLinkDom={hoveredLinkDom}
					openModal={openModal}
					onMouseLeave={() => setHoveredLink(null)}
				/>
			)}
			<div className="flex h-full w-full flex-col">
				<EditorMenu editor={editor} toggleModal={toggleModal} />
				<EditorContent
					className="rounded-box h-full w-full min-w-0 bg-base-100"
					editor={editor}
				/>
			</div>
		</>
	);
}
