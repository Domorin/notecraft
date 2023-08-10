import { Extension } from "@tiptap/react";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { CustomLinkAttributeName } from "./custom_link_mark";

export function createHoverExtension(
	onLinkHover: (dom: HTMLAnchorElement | null) => void
) {
	return Extension.create({
		name: "hover",
		addProseMirrorPlugins() {
			return [
				new Plugin({
					key: new PluginKey("hover"),
					props: {
						handleDOMEvents: {
							mouseover(view, event) {
								const target = event.target as HTMLElement;
								if (
									!target.getAttribute(
										CustomLinkAttributeName
									)
								) {
									onLinkHover(null);
									return;
								}

								onLinkHover(target as HTMLAnchorElement);
								// enable tooltip
							},
						},
					},
				}),
			];
		},
	});
}
