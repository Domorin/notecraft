import { SuggestionOptions } from "@tiptap/suggestion";
import {
	EditorCommands,
	CommandDescriptor,
} from "../../commands/editor_commands";

const getSuggestionItems: SuggestionOptions<CommandDescriptor>["items"] = ({
	query,
}) => {
	return EditorCommands.filter(
		(item) =>
			!item.hideOnAutocompleteMenu &&
			(item.title.toLowerCase().includes(query.toLowerCase()) ||
				item.keywords?.some((keyword) =>
					keyword.toLowerCase().includes(query.toLowerCase())
				))
	);
};

export default getSuggestionItems;
