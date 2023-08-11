import { Editor } from "@tiptap/react";
import { AutocompleteCommandProps } from "./autocomplete_extension";
import { SuggestionOptions } from "@tiptap/suggestion";

const items: AutocompleteCommandProps[] = [
	{
		title: "H1",
		command: ({ editor, range }) => {
			editor
				.chain()
				.focus()
				.deleteRange(range)
				.setNode("heading", { level: 1 })
				.run();
		},
	},
	{
		title: "H2",
		command: ({ editor, range }) => {
			editor
				.chain()
				.focus()
				.deleteRange(range)
				.setNode("heading", { level: 2 })
				.run();
		},
	},
	{
		title: "bold",
		command: ({ editor, range }) => {
			editor.chain().focus().deleteRange(range).toggleBold().run();
		},
	},
	{
		title: "italic",
		command: ({ editor, range }) => {
			editor.chain().focus().deleteRange(range).setMark("italic").run();
		},
	},
	{
		title: "image",
		command: ({ editor, range }) => {
			editor
				.chain()
				.focus()
				.deleteRange(range)
				.setNode("paragraph")
				.run();
		},
	},
];

const getSuggestionItems: SuggestionOptions<AutocompleteCommandProps>["items"] =
	({ query }) => {
		return items
			.filter((item) =>
				item.title.toLowerCase().startsWith(query.toLowerCase())
			)
			.slice(0, 10);
	};

export default getSuggestionItems;
