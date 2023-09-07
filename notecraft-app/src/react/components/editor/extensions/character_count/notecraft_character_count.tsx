import { calculateAttrLength } from "@/lib/note_limit_utils";
import CharacterCount from "@tiptap/extension-character-count";
import { Plugin, PluginKey } from "@tiptap/pm/state";

export const NotecraftCharacterCount = CharacterCount.extend({
	onBeforeCreate() {
		this.storage.characters = (options) => {
			const node = options?.node || this.editor.state.doc;
			const mode = options?.mode || this.options.mode;

			if (mode === "textSize") {
				let attrTextCount = 0;
				node.nodesBetween(0, node.content.size, (node) => {
					attrTextCount += calculateAttrLength(node);

					node.marks.forEach((mark) => {
						attrTextCount += calculateAttrLength(mark);
					});
				});

				const text = node.textBetween(
					0,
					node.content.size,
					undefined,
					" "
				);

				const originalTextCount = text.length;
				const newTextCount = originalTextCount + attrTextCount;

				return newTextCount;
			}

			return node.nodeSize;
		};

		this.storage.words = (options) => {
			const node = options?.node || this.editor.state.doc;
			const text = node.textBetween(0, node.content.size, " ", " ");
			const words = text.split(" ").filter((word) => word !== "");

			return words.length;
		};
	},

	// https://github.com/ueberdosis/tiptap/blob/main/packages/extension-character-count/src/character-count.ts
	addProseMirrorPlugins() {
		return [
			new Plugin({
				key: new PluginKey("characterCount"),
				filterTransaction: (transaction, state) => {
					const limit = this.options.limit;

					// Nothing has changed or no limit is defined. Ignore it.
					if (
						!transaction.docChanged ||
						limit === 0 ||
						limit === null ||
						limit === undefined
					) {
						return true;
					}

					const oldSize = this.storage.characters({
						node: state.doc,
					});
					const newSize = this.storage.characters({
						node: transaction.doc,
					});

					// Everything is in the limit. Good.
					if (newSize <= limit) {
						return true;
					}

					// The limit has already been exceeded but will be reduced.
					if (
						oldSize > limit &&
						newSize > limit &&
						newSize <= oldSize
					) {
						return true;
					}

					// The limit has already been exceeded and will be increased further.
					if (
						oldSize > limit &&
						newSize > limit &&
						newSize > oldSize
					) {
						return false;
					}

					// Lazy alert
					alert(
						"Character limit exceeded. Please remove some characters."
					);

					// We disable handling paste if the paste causes char count to go over limit because we added href + src attrs to character limits
					// We need to do extra work to handle counting characters when pasting over the limit
					return false;

					// const isPaste = transaction.getMeta("paste");

					// // Block all exceeding transactions that were not pasted.
					// if (!isPaste) {
					// 	return false;
					// }

					// // For pasted content, we try to remove the exceeding content.
					// const pos = transaction.selection.$head.pos;
					// const over = newSize - limit;
					// const from = pos - over;
					// const to = pos;

					// // It’s probably a bad idea to mutate transactions within `filterTransaction`
					// // but for now this is working fine.
					// console.log({ from, to });
					// transaction.deleteRange(from, to);

					// // In some situations, the limit will continue to be exceeded after trimming.
					// // This happens e.g. when truncating within a complex node (e.g. table)
					// // and ProseMirror has to close this node again.
					// // If this is the case, we prevent the transaction completely.
					// const updatedSize = this.storage.characters({
					// 	node: transaction.doc,
					// });

					// if (updatedSize > limit) {
					// 	return false;
					// }

					// return true;
				},
			}),
		];
	},
});
