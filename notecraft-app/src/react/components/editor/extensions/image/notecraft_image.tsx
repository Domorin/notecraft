import Image, { ImageOptions } from "@tiptap/extension-image";
import { Editor as CoreEditor } from "@tiptap/core";
import { mergeAttributes } from "@tiptap/react";

declare module "@tiptap/core" {
	interface Commands<ReturnType> {
		notecraftImage: {
			openImageModal: () => ReturnType;
		};
	}
}

export interface CustomImageOptions extends ImageOptions {
	toggleModal: (editor: CoreEditor) => void;
}

export const NotecraftImage = Image.extend<CustomImageOptions>({
	addKeyboardShortcuts() {
		return {
			"Mod-Alt-i": () => this.editor.commands.openImageModal(),
		};
	},
	addCommands() {
		return {
			...this.parent?.(),
			openImageModal:
				() =>
				({ editor }) => {
					this.options.toggleModal(editor);
					return true;
				},
		};
	},

	// https://codesandbox.io/s/tiptap-image-erd45?file=/src/extensions/image.js:234-437
	// for centering
	renderHTML({ HTMLAttributes }) {
		const { style } = HTMLAttributes;
		return [
			"figure",
			{ style },
			[
				"img",
				mergeAttributes(this.options.HTMLAttributes, HTMLAttributes),
			],
		];
	},
});
