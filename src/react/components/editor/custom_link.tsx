import { MarkType } from "@tiptap/pm/model";
import { PluginKey, Plugin } from "@tiptap/pm/state";
import {
	ExtendedRegExpMatchArray,
	InputRule,
	Node,
	ReactNodeViewRenderer,
	getAttributes,
} from "@tiptap/react";
import { CustomLinkComponent } from "./link";

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
	toggleModal: () => void;
}

export const CustomLink = Node.create<CustomLinkOptions>({
	name: "customLink",
	content: "text*",

	group: "inline",
	inline: true,

	addAttributes() {
		return {
			href: {},
			title: {},
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

	renderHTML({ node, HTMLAttributes }) {
		return [
			"a",
			{
				...HTMLAttributes,
				ref: "noopener noreferrer nofollow",
				target: "_blank",
				title: HTMLAttributes.href,
			},
			0,
		];
	},

	addCommands() {
		return {
			createCustomLink:
				(opts: { title: string; href: string }) => (t) => {
					const state = t.state;

					const from = state.selection.$head.start() - 1;
					const to = state.selection.$head.end();

					return t
						.chain()
						.command(({ tr }) => {
							tr.replaceWith(
								from,
								to,
								this.type.create({
									title: opts.title,
									href: opts.href,
								})
							);
							tr.insertText(opts.title, from + 1);
							return true;
						})
						.run();
				},
		};
	},

	addKeyboardShortcuts() {
		return {
			"Mod-k": (test) => {
				this.options.toggleModal();
				return true;
			},
			Enter: ({ editor }) => {
				console.log("enter!");
				return false;
			},
		};
	},

	addNodeView() {
		return ReactNodeViewRenderer(CustomLinkComponent);
	},

	addInputRules() {
		return [
			new InputRule({
				find: /\[(.*)\]\((.*)\)/g,
				handler: ({ state, range, match }) => {
					const attributes = {
						title: match[1],
						href: match[2],
					};

					const { tr } = state;
					const start = range.from;
					const end = range.to;

					console.log("input", start, end);

					tr.replaceWith(start, end, this.type.create(attributes));
					tr.insertText(attributes.title, start + 1);
					return;
				},
			}),
		];
	},

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
