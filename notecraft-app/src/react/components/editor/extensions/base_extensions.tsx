import Placeholder from "@tiptap/extension-placeholder";
import TaskItem from "@tiptap/extension-task-item";
import TaskList from "@tiptap/extension-task-list";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import { EditorOptions } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

export const baseExtensions: EditorOptions["extensions"] = [
	StarterKit.configure({
		history: false,
	}),
	Placeholder.configure({
		placeholder: "Type / or highlight text for commands",
		showOnlyWhenEditable: true,
	}),
	// Markdown.configure({
	// 	breaks: true,
	// 	html: true,
	// 	transformCopiedText: true,
	// 	transformPastedText: true,
	// }),
	TextAlign.configure({
		types: ["heading", "paragraph", "image"],
	}),
	TaskList,
	TaskItem.configure({
		nested: true,
	}),
	Underline,
	// Table.configure({
	// 	resizable: true,
	// }),
	// TableRow,
	// TableHeader,
	// TableCell,
];
