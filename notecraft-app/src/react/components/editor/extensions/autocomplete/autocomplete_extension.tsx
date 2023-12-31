import { Editor as CoreEditor, Extension } from "@tiptap/core";
import Suggestion, {
	SuggestionOptions,
	SuggestionProps,
} from "@tiptap/suggestion";
import { ComponentProps } from "react";
import { AutocompleteCommandsList } from "./autocomplete_commands_list";
import { CommandDescriptor } from "../../commands/editor_commands";

declare module "@tiptap/core" {
	interface Commands<ReturnType> {
		commandAutocomplete: {
			showCommandAutocompleteMenu: (
				items: ComponentProps<typeof AutocompleteCommandsList> | null
			) => ReturnType;
		};
	}
}

export type CommandSuggestionOptions = Omit<
	SuggestionOptions<CommandDescriptor>,
	"editor"
>;

export type CommandSuggestionProps = SuggestionProps<CommandDescriptor> & {
	editor: CoreEditor;
};

interface Options {
	suggestion: CommandSuggestionOptions;
	showMenu: (
		items: ComponentProps<typeof AutocompleteCommandsList> | null
	) => void;
}
// https://codesandbox.io/s/tiptap-react-slash-command-e3j3u?file=/src/tiptap
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
