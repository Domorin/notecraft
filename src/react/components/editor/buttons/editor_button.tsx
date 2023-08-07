import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Editor } from "@tiptap/react";
import classNames from "classnames";

export function EditorButton(props: {
	hotkey: string;
	label: string;
	editor: Editor;
	onClick: (editor: Editor) => void;
	icon: IconProp;
}) {
	const isActive = props.editor.isActive(props.label);

	return (
		<button
			title={`${props.label} (${props.hotkey})`}
			className={classNames("btn-ghost btn-xs join-item btn", {
				"btn-active": isActive,
			})}
			onClick={(e) => {
				props.onClick(props.editor);
			}}
		>
			<FontAwesomeIcon icon={props.icon} />
		</button>
	);
}
