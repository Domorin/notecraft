import { IconDefinition } from "@fortawesome/free-solid-svg-icons";
import { Editor as CoreEditor, Extension, Range } from "@tiptap/core";
import Suggestion, {
	SuggestionOptions,
	SuggestionProps,
} from "@tiptap/suggestion";
import { Hotkey } from "../../keyboard_types";
import { ComponentProps } from "react";
import { AutocompleteCommandsList } from "./autocomplete_commands_list";

declare module "@tiptap/core" {
	interface Commands<ReturnType> {
		commandAutocomplete: {
			showCommandAutocompleteMenu: (
				items: ComponentProps<typeof AutocompleteCommandsList> | null
			) => ReturnType;
		};
	}
}

export type MarkDescriptor = {
	title: string;
	hotkey?: Hotkey;
	markName: string;
	icon: IconDefinition;
	command: (props: {
		editor: CoreEditor;
		range?: Range;
		origin: "Menu" | "Autocomplete";
	}) => void;
};

export type CommandSuggestionOptions = Omit<
	SuggestionOptions<MarkDescriptor>,
	"editor"
>;

export type CommandSuggestionProps = SuggestionProps<MarkDescriptor> & {
	editor: CoreEditor;
};

interface Options {
	suggestion: CommandSuggestionOptions;
	showMenu: (
		items: ComponentProps<typeof AutocompleteCommandsList> | null
	) => void;
}
// https://codesandbox.io/s/tiptap-react-slash-command-e3j3u?file=/src/tiptap.jsx
const Commands = Extension.create<Options>({
	name: "commandAutocomplete",

	addOptions() {
		return {
			...this.parent?.(),
			suggestion: {
				char: "/",
				startOfLine: false,
				command: ({ editor, range, props }) => {
					props.command({ editor, range, origin: "Autocomplete" });
				},
			},
		};
	},

	addCommands() {
		return {
			showCommandAutocompleteMenu: (items) => () => {
				this.options.showMenu(items);
				return true;
			},
		};
	},

	addProseMirrorPlugins() {
		return [
			Suggestion({
				editor: this.editor,
				...this.options.suggestion,
			}),
		];
	},
});

export default Commands;
