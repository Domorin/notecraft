import { SuggestionOptions } from "@tiptap/suggestion";
import { EditorCommands, MarkDescriptor } from "../../commands/editor_commands";

const getSuggestionItems: SuggestionOptions<MarkDescriptor>["items"] = ({
	query,
}) => {
	return EditorCommands.filter(
		(item) =>
			!item.hideOnAutocompleteMenu &&
			item.title.toLowerCase().startsWith(query.toLowerCase())
	);
};

export default getSuggestionItems;
