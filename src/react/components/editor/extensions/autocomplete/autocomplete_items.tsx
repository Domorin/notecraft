import {
	faBold,
	faCode,
	faFileCode,
	faItalic,
	faLink,
	faList,
	faList12,
	faQuoteLeft,
	faStrikethrough,
	faTasks,
	faUnderline,
} from "@fortawesome/free-solid-svg-icons";
import { Editor as CoreEditor, Range } from "@tiptap/core";
import { SuggestionOptions } from "@tiptap/suggestion";
import { MarkDescriptor } from "./autocomplete_extension";

export const editorMarks = {};

function BaseChain(opts: { editor: CoreEditor; range?: Range }) {
	const { editor, range } = opts;

	const initial = editor.chain().focus();
	if (range) {
		initial.deleteRange(range);
	}

	return initial;
}

export const EditorCommands: MarkDescriptor[] = [
	{
		title: "Bold",
		command: (o) => BaseChain(o).toggleBold().run(),
		hotkey: "Ctrl B",
		icon: faBold,
		markName: "bold",
	},
	{
		title: "Italic",
		command: (o) => BaseChain(o).toggleItalic().run(),
		hotkey: "Ctrl Shift X",
		icon: faItalic,
		markName: "italic",
	},
	{
		title: "Underline",
		command: (o) => BaseChain(o).toggleUnderline().run(),
		hotkey: "Ctrl U",
		icon: faUnderline,
		markName: "underline",
	},
	{
		title: "Strike",
		command: (o) => BaseChain(o).toggleStrike().run(),
		hotkey: "Ctrl Shift X",
		icon: faStrikethrough,
		markName: "strike",
	},
	{
		title: "Block Quote",
		command: (o) => BaseChain(o).toggleBlockquote().run(),
		hotkey: "Ctrl Shift B",
		icon: faQuoteLeft,
		markName: "blockquote",
	},
	{
		title: "Bullet List",
		command: (o) => BaseChain(o).toggleBulletList().run(),
		hotkey: "Ctrl Shift 8",
		icon: faList,
		markName: "bulletlist",
	},
	{
		title: "Ordered List",
		command: (o) => BaseChain(o).toggleOrderedList().run(),
		hotkey: "Ctrl Shift 7",
		icon: faList12,
		markName: "orderedlist",
	},
	{
		title: "Task List",
		command: (o) => BaseChain(o).toggleTaskList().run(),
		hotkey: "Ctrl Shift 9",
		icon: faTasks,
		markName: "tasklist",
	},
	{
		title: "Code",
		command: (o) => BaseChain(o).toggleCode().run(),
		hotkey: "Ctrl E",
		icon: faCode,
		markName: "code",
	},
	{
		title: "Code Block",
		command: (o) => BaseChain(o).toggleCodeBlock().run(),
		hotkey: "Ctrl Alt C",
		icon: faFileCode,
		markName: "codeblock",
	},
	{
		title: "Link",
		command: (o) => {
			o.origin === "Autocomplete"
				? BaseChain(o).setCustomLink({
						href: "",
						title: "",
				  })
				: BaseChain(o).openLinkModal().run();
		},
		icon: faLink,
		markName: "customLink",
	},
];

// {
// 	title: "H1",
// 	command: ({ editor, range }) => {
// 		editor
// 			.chain()
// 			.focus()
// 			.deleteRange(range)
// 			.setNode("heading", { level: 1 })
// 			.run();
// 	},
// },
// {
// 	title: "H2",
// 	command: ({ editor, range }) => {
// 		editor
// 			.chain()
// 			.focus()
// 			.deleteRange(range)
// 			.setNode("heading", { level: 2 })
// 			.run();
// 	},
// },
// {
// 	title: "bold",
// 	command: ({ editor, range }) => {
// 		editor.chain().focus().deleteRange(range).toggleBold().run();
// 	},
// },
// {
// 	title: "italic",
// 	command: ({ editor, range }) => {
// 		editor.chain().focus().deleteRange(range).setMark("italic").run();
// 	},
// },
// {
// 	title: "image",
// 	command: ({ editor, range }) => {
// 		editor
// 			.chain()
// 			.focus()
// 			.deleteRange(range)
// 			.setNode("paragraph")
// 			.run();
// 	},
// },

const getSuggestionItems: SuggestionOptions<MarkDescriptor>["items"] = ({
	query,
}) => {
	return EditorCommands.filter((item) =>
		item.title.toLowerCase().startsWith(query.toLowerCase())
	).slice(0, 10);
};

export default getSuggestionItems;
