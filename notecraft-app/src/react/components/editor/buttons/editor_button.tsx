import { Editor } from "@tiptap/react";
import classNames from "classnames";
import { CommandIcon, CommandDescriptor } from "../commands/editor_commands";

export function EditorButton(props: {
	title: string;
	hotkey: string | undefined;
	markName?: string;
	markAttributes?: Record<string, unknown>;
	editor: Editor;
	onClick: (editor: Editor) => void;
	icon: CommandDescriptor["icon"];
}) {
	let isActive = false;
	if (props.markName) {
		isActive = props.editor.isActive(props.markName, props.markAttributes);
	} else if (props.markAttributes) {
		isActive = props.editor.isActive(props.markAttributes);
	}

	const titleStrings = [props.title];
	if (props.hotkey) titleStrings.push(`(${props.hotkey})`);

	return (
		<button
			title={titleStrings.join(" ")}
			className={classNames("btn-ghost btn-xs join-item btn", {
				"btn-active": isActive,
			})}
			onClick={(_e) => {
				props.onClick(props.editor);
			}}
		>
			<CommandIcon icon={props.icon} />
		</button>
	);
}
