import { BubbleMenu, Editor } from "@tiptap/react";
import { EditorButton } from "./buttons/editor_button";
import { EditorCommands } from "./extensions/autocomplete/autocomplete_items";

export function EditorMenu(props: { editor: Editor }) {
	const { editor } = props;

	return (
		<BubbleMenu editor={editor}>
			<div className="join overflow-hidden border border-neutral bg-base-300 shadow">
				{EditorCommands.map((val) => (
					<EditorButton
						key={val.title}
						editor={editor}
						hotkey={val.hotkey}
						icon={val.icon}
						onClick={(editor) =>
							val.command({ editor, origin: "Menu" })
						}
						title={val.title}
						markName={val.markName}
					/>
				))}
			</div>
		</BubbleMenu>
	);
}