import { useModal } from "@/react/hooks/use_modal";
import { Editor, getMarkRange } from "@tiptap/react";
import { LinkTooltip } from "./extensions/custom_link_tooltip";

export function EditorLinkTooltip(props: {
	editor: Editor;
	hoveredLinkDom: HTMLAnchorElement;
	openModal: ReturnType<typeof useModal<"EditorLinkInput">>["openModal"];
	onMouseLeave: () => void;
}) {
	const { editor, hoveredLinkDom, openModal } = props;

	return (
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
			onMouseLeave={props.onMouseLeave}
		/>
	);
}
