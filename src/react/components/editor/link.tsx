import { NodeViewRendererProps, NodeViewWrapper } from "@tiptap/react";

export function CustomLinkComponent(props: NodeViewRendererProps) {
	console.log(props.HTMLAttributes);

	return (
		<NodeViewWrapper>
			<a>I'm a custom view!</a>
		</NodeViewWrapper>
	);
}
