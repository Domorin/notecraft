import { CommandSuggestionOptions } from "./autocomplete_extension";

const renderItems: CommandSuggestionOptions["render"] = () => {
	return {
		onStart: (props) => {
			// component = new ReactRenderer(CommandsList, {
			// 	props,
			// 	editor: props.editor,
			// });

			props.editor.commands.showCommandAutocompleteMenu(props);
		},
	};
};

export default renderItems;
