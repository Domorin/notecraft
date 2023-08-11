import { Editor as CoreEditor, Extension, Range } from "@tiptap/core";
import Suggestion, {
	SuggestionOptions,
	SuggestionProps,
} from "@tiptap/suggestion";

declare module "@tiptap/core" {
	interface Commands<ReturnType> {
		commandAutocomplete: {
			/**
			 * Set a link mark
			 */
			showCommandAutocompleteMenu: (
				items: CommandSuggestionProps | null
			) => ReturnType;
		};
	}
}

export type AutocompleteCommandProps = {
	title: string;
	command: (props: { editor: CoreEditor; range: Range }) => void;
};

export type CommandSuggestionOptions = Omit<
	SuggestionOptions<AutocompleteCommandProps>,
	"editor"
>;

export type CommandSuggestionProps =
	SuggestionProps<AutocompleteCommandProps> & { editor: CoreEditor };

interface Options {
	suggestion: CommandSuggestionOptions;
	showMenu: (items: CommandSuggestionProps | null) => void;
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
					props.command({ editor, range });
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
