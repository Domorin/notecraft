import { Editor as CoreEditor } from "@tiptap/core";
import { MarkType } from "@tiptap/pm/model";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import {
	Node,
	ReactNodeViewRenderer,
	getAttributes,
	mergeAttributes,
} from "@tiptap/react";
import { CustomLinkComponent } from "./custom_link_component";

declare module "@tiptap/core" {
	interface Commands<ReturnType> {
		customLink: {
			createCustomLink: (opts: {
				title: string;
				href: string;
			}) => ReturnType;
			// setCustomLink: (attributes?: { language: string }) => ReturnType;
			// /**
			//  * Toggle a code block
			//  */
			// toggleCustomLink: (attributes?: { language: string }) => ReturnType;
		};
	}
}

export interface CustomLinkOptions {
	toggleModal: (editor: CoreEditor) => void;
}

export const CustomLink = Node.create<CustomLinkOptions>({
	name: "customLink",
	group: "inline",
	inline: true,
	selectable: false,
	atom: true,

	addAttributes() {
		return {
			href: {
				default: null,
				isRequired: true,
			},
			title: {
				default: null,
				isRequired: true,
			},
		};
	},

	// parseHTML() {
	// 	return [
	// 		{
	// 			tag: "pre",
	// 			preserveWhitespace: "full",
	// 		},
	// 	];
	// },

	renderHTML({ HTMLAttributes }) {
		return ["react-component", mergeAttributes(HTMLAttributes)];
	},

	addCommands() {
		return {
			createCustomLink:
				(opts: { title: string; href: string }) => (t) => {
					const state = t.state;
					state.tr.replaceSelectionWith(this.type.create(opts));
					t.commands.focus();
					return true;
				},
		};
	},

	addKeyboardShortcuts() {
		return {
			"Mod-k": ({ editor }) => {
				this.options.toggleModal(this.editor);
				return true;
			},
			Backspace: () =>
				this.editor.commands.command(({ tr, state }) => {
					let isMention = false;
					const { selection } = state;
					const { empty, anchor } = selection;

					if (!empty) {
						return false;
					}

					// This is only considering a single backspace. Its removing a single character
					state.doc.nodesBetween(anchor - 1, anchor, (node, pos) => {
						if (node.type.name === this.name) {
							isMention = true;
							tr.insertText("", pos, pos + node.nodeSize);
						}
						return true;
					});

					return isMention;
				}),
		};
	},

	addNodeView() {
		return ReactNodeViewRenderer(CustomLinkComponent);
	},

	// addInputRules() {
	// 	return [
	// 		new InputRule({
	// 			find: /\[(.*)\]\((.*)\)/g,
	// 			handler: ({ state, range, match }) => {
	// 				const attributes = {
	// 					title: match[1],
	// 					href: match[2],
	// 				};

	// 				const { tr } = state;
	// 				const start = range.from;
	// 				const end = range.to;

	// 				tr.insert(start, this.type.create(attributes));
	// 				return;
	// 			},
	// 		}),
	// 	];
	// },

	addProseMirrorPlugins() {
		const plugins: Plugin[] = [];

		// if (this.options.autolink) {
		// 	plugins.push(
		// 		autolink({
		// 			type: this.type,
		// 			validate: this.options.validate,
		// 		})
		// 	);
		// }

		plugins.push(
			clickHandler({
				// @ts-expect-error
				type: this.type,
			})
		);

		// if (this.options.linkOnPaste) {
		// 	plugins.push(
		// 		pasteHandler({
		// 			editor: this.editor,
		// 			type: this.type,
		// 		})
		// 	);
		// }

		return plugins;
	},
});

type ClickHandlerOptions = {
	type: MarkType;
};

export function clickHandler(options: ClickHandlerOptions): Plugin {
	return new Plugin({
		key: new PluginKey("handleClickLink"),
		props: {
			handleClick: (view, pos, event) => {
				if (event.button !== 0) {
					return false;
				}

				const attrs = getAttributes(view.state, options.type.name);
				const link = (event.target as HTMLElement)?.closest("a");

				const href = link?.href ?? attrs.href;
				const target = link?.target ?? attrs.target;

				if (link && href) {
					window.open(href, target);

					return true;
				}

				return false;
			},
		},
	});
}
