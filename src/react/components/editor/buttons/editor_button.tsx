import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Editor } from "@tiptap/react";
import classNames from "classnames";

export function EditorButton(props: {
	hotkey: string;
	title: string;
	markNameOverride?: string;
	editor: Editor;
	onClick: (editor: Editor) => void;
	icon: IconProp;
}) {
	const isActive = props.editor.isActive(
		props.markNameOverride ?? props.title
	);

	return (
		<button
			title={`${props.title} (${props.hotkey})`}
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
