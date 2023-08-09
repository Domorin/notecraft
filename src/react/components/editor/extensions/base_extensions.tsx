import Placeholder from "@tiptap/extension-placeholder";
import TaskItem from "@tiptap/extension-task-item";
import TaskList from "@tiptap/extension-task-list";
import Underline from "@tiptap/extension-underline";
import { EditorOptions } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Markdown } from "tiptap-markdown";

export const baseExtensions: EditorOptions["extensions"] = [
	StarterKit.configure({
		history: false,
	}),
	Placeholder.configure({
		placeholder: "Start typing...",
	}),
	Markdown.configure({
		breaks: true,
		html: true,
		transformCopiedText: true,
		transformPastedText: true,
	}),
	TaskList,
	TaskItem.configure({
		nested: true,
	}),
	Underline,
];
