import { Editor as CoreEditor } from "@tiptap/core";
import { MarkType } from "@tiptap/pm/model";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import {
	Mark,
	getAttributes,
	getMarkRange,
	mergeAttributes,
} from "@tiptap/react";
import { getCurrentMark } from "../markdown_editor";

declare module "@tiptap/core" {
	interface Commands<ReturnType> {
		customLink: {
			/**
			 * Set a link mark
			 */
			setCustomLink: (attributes: {
				href: string;
				title: string;
				target?: string | null;
			}) => ReturnType;
			unsetCustomLink: () => ReturnType;
			openLinkModal: () => ReturnType;
		};
	}
}

export interface CustomLinkOptions {
	toggleModal: (
		editor: CoreEditor,
		opts: { href: string; title: string }
	) => void;
}

export const CustomLinkAttributeName = "custom-link";

export const CustomLink = Mark.create<CustomLinkOptions>({
	name: "customLink",
	group: "inline",

	addAttributes() {
		return {
			[CustomLinkAttributeName]: {
				default: true,
			},
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

	parseHTML() {
		return [
			{
				tag: "a",
				preserveWhitespace: "full",
			},
		];
	},

	renderHTML({ HTMLAttributes }) {
		return ["a", mergeAttributes(HTMLAttributes), 0];
	},

	// addCommands() {
	// 	return {
	// 		editCustomLink: (opts: { title: string; href: string }) => (t) => {
	// 			// const state = t.state;

	// 			t.editor.commands.updateAttributes(this.type, opts);

	// 			// state.tr.replaceSelectionWith(this.type.create(opts));
	// 			t.commands.focus();
	// 			return true;
	// 		},
	// 		createCustomLink:
	// 			(opts: { title: string; href: string }) => (t) => {
	// 				// const state = t.state;

	// 				t.editor.commands.updateAttributes(this.type, opts);
	// 				// state.tr.replaceSelectionWith(this.type.create(opts));
	// 				t.commands.focus();
	// 				return true;
	// 			},
	// 	};
	// },

	addCommands() {
		return {
			setCustomLink:
				(attributes) =>
				({ chain }) => {
					return chain()
						.extendMarkRange(this.name)
						.setMark(this.name, attributes)
						.deleteSelection()
						.insertContent(attributes.title)
						.focus()
						.run();
				},
			unsetCustomLink:
				() =>
				({ chain }) => {
					return chain()
						.extendMarkRange(this.name)
						.unsetMark(this.name)
						.focus()
						.selectNodeBackward()
						.run();
				},
			openLinkModal:
				() =>
				({ editor }) => {
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

					this.options.toggleModal(this.editor, {
						href: initialHref,
						title: initialTitle,
					});
					return true;
				},
		};
	},

	addKeyboardShortcuts() {
		return {
			"Mod-k": ({ editor }) => {
				return editor.commands.openLinkModal();
			},
			Space: ({ editor }) => {
				if (!editor.isActive(this.name)) {
					return false;
				}

				const selection = editor.state.selection;

				const node = editor.state.doc.nodeAt(selection.to);

				const nodeMark = node?.marks.find(
					(val) => val.type === this.type
				);

				// If there is not a node mark at the next character, use Space to unset the mark
				if (!nodeMark) {
					editor.chain().unsetMark(this.name).run();
				}

				return false;
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

	// addNodeView() {
	// 	return ReactNodeViewRenderer(CustomLinkComponent);
	// },

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
