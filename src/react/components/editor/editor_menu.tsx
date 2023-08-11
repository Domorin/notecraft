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
import { BubbleMenu, Editor } from "@tiptap/react";
import { EditorButton } from "./buttons/editor_button";

export function EditorMenu(props: {
	editor: Editor;
	toggleModal: (editor: CoreEditor) => void;
}) {
	const { editor, toggleModal } = props;

	return (
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
						editor?.chain().focus().toggleOrderedList().run()
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
					onClick={() => editor?.chain().focus().toggleCode().run()}
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
					onClick={() => editor?.chain().focus().toggleStrike().run()}
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
	);
}
