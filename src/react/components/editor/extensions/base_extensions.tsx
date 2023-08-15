import Placeholder from "@tiptap/extension-placeholder";
import TaskItem from "@tiptap/extension-task-item";
import TaskList from "@tiptap/extension-task-list";
import Underline from "@tiptap/extension-underline";
import { EditorOptions } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Table from "@tiptap/extension-table";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import TableRow from "@tiptap/extension-table-row";

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
	TaskList,
	TaskItem.configure({
		nested: true,
	}),
	Underline,
	Table.configure({
		resizable: true,
	}),
	TableRow,
	TableHeader,
	TableCell,
];
