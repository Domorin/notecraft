import {
	IconDefinition,
	faAlignCenter,
	faAlignJustify,
	faAlignLeft,
	faAlignRight,
	faBold,
	faCode,
	faFileCode,
	faGripLines,
	faImage,
	faItalic,
	faLink,
	faList,
	faList12,
	faQuoteLeft,
	faStrikethrough,
	faTasks,
	faUnderline,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Editor as CoreEditor, Range } from "@tiptap/core";
import {
	CommandHeadingIcon,
	HeadingLevel,
} from "./custom_icons/command_heading_icon";
import { Hotkey } from "./keyboard_types";

export type MarkDescriptor = {
	title: string;
	hotkey?: Hotkey;
	markName?: string;
	markAttributes?: Record<string, unknown>;
	icon: IconDefinition | (() => JSX.Element);
	hideOnBubbleMenu?: boolean;
	hideOnAutocompleteMenu?: boolean;
	command: (props: {
		editor: CoreEditor;
		range?: Range;
		origin: "Menu" | "Autocomplete";
	}) => void;
};

function BaseChain(opts: { editor: CoreEditor; range?: Range }) {
	const { editor, range } = opts;

	if (range) {
		editor.commands.deleteRange(range);
	}
	return editor.chain().focus();
}

export function CommandIcon(props: { icon: MarkDescriptor["icon"] }) {
	return typeof props.icon === "function" ? (
		props.icon()
	) : (
		<FontAwesomeIcon icon={props.icon} />
	);
}

export const EditorCommands: MarkDescriptor[] = [
	{
		title: "Bold",
		command: (o) => BaseChain(o).toggleBold().run(),
		hotkey: "Ctrl B",
		icon: faBold,
		markName: "bold",
		hideOnAutocompleteMenu: true,
	},
	{
		title: "Italic",
		command: (o) => BaseChain(o).toggleItalic().run(),
		hotkey: "Ctrl Shift X",
		icon: faItalic,
		markName: "italic",
		hideOnAutocompleteMenu: true,
	},
	{
		title: "Underline",
		command: (o) => BaseChain(o).toggleUnderline().run(),
		hotkey: "Ctrl U",
		icon: faUnderline,
		markName: "underline",
		hideOnAutocompleteMenu: true,
	},
	{
		title: "Strike",
		command: (o) => BaseChain(o).toggleStrike().run(),
		hotkey: "Ctrl Shift X",
		icon: faStrikethrough,
		markName: "strike",
		hideOnAutocompleteMenu: true,
	},
	{
		title: "Block Quote",
		command: (o) => BaseChain(o).toggleBlockquote().run(),
		hotkey: "Ctrl Shift B",
		icon: faQuoteLeft,
		markName: "blockquote",
		hideOnBubbleMenu: true,
	},
	{
		title: "Bullet List",
		command: (o) => BaseChain(o).toggleBulletList().run(),
		hotkey: "Ctrl Shift 8",
		icon: faList,
		markName: "bulletlist",
		hideOnBubbleMenu: true,
	},
	{
		title: "Ordered List",
		command: (o) => BaseChain(o).toggleOrderedList().run(),
		hotkey: "Ctrl Shift 7",
		icon: faList12,
		markName: "orderedlist",
		hideOnBubbleMenu: true,
	},
	{
		title: "Task List",
		command: (o) => BaseChain(o).toggleTaskList().run(),
		hotkey: "Ctrl Shift 9",
		icon: faTasks,
		markName: "tasklist",
		hideOnBubbleMenu: true,
	},
	{
		title: "Code",
		command: (o) => BaseChain(o).toggleCode().run(),
		hotkey: "Ctrl E",
		icon: faCode,
		markName: "code",
		hideOnAutocompleteMenu: true,
	},
	{
		title: "Code Block",
		command: (o) => BaseChain(o).toggleCodeBlock().run(),
		hotkey: "Ctrl Alt C",
		icon: faFileCode,
		markName: "codeblock",
		hideOnBubbleMenu: true,
	},
	{
		title: "Link",
		command: (o) => {
			BaseChain(o).openLinkModal().run();
		},
		icon: faLink,
		markName: "customLink",
	},
	{
		title: "Image",
		command: (o) => BaseChain(o).openImageModal().run(),
		markName: "image",
		icon: faImage,
	},
	{
		title: "Divider",
		command: (o) => BaseChain(o).setHorizontalRule().run(),
		icon: faGripLines,
		markName: "horizontalrule",
		hideOnBubbleMenu: true,
	},
	{
		title: "Justify Left",
		command: (o) => BaseChain(o).setTextAlign("left").run(),
		icon: faAlignLeft,
		markAttributes: { textAlign: "left" },
	},
	{
		title: "Justify Center",
		command: (o) => BaseChain(o).setTextAlign("center").run(),
		icon: faAlignCenter,
		markAttributes: { textAlign: "center" },
	},
	{
		title: "Justify Right",
		command: (o) => BaseChain(o).setTextAlign("right").run(),
		icon: faAlignRight,
		markAttributes: { textAlign: "right" },
	},
	{
		title: "Justify",
		command: (o) => BaseChain(o).setTextAlign("justify").run(),
		icon: faAlignJustify,
		markAttributes: { textAlign: "justify" },
	},
	...createHeadings(),
];

function createHeadings(): MarkDescriptor[] {
	return ([1, 3, 5] as HeadingLevel[]).map(
		(level: HeadingLevel, index: number) => ({
			title: `Heading ${index + 1}`,
			command: (o) => {
				BaseChain(o).toggleHeading({ level }).run();
			},
			icon: () => <CommandHeadingIcon iconIndex={index} />,
			markName: "heading",
			markAttributes: { level: level },
			hideOnBubbleMenu: level > 1,
		})
	);
}
