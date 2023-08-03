import { Spinner } from "../spinner";
import { useNoteListCreatedQuery } from "../../hooks/trpc/use_note_list_created_query";
import { ListType } from "@/server/routers/note";
import { useNoteListRecentsQuery } from "../../hooks/trpc/use_note_list_recents_query";
import { SidebarList } from "./sidebar_list";
import { queryFirst } from "lib0/indexeddb";

export function SidebarListNotes(props: { active: ListType }) {
	switch (props.active) {
		case "Created":
			return <SidebarListCreated />;
		case "Viewed":
			return <SidebarListRecents />;
		default:
			throw new Error("hi");
	}
}
function SidebarListRecents() {
	const { isLoading, queries } = useNoteListRecentsQuery();

	if (isLoading) {
		return <Spinner />;
	}

	return <SidebarList slugs={queries} />;
}
function SidebarListCreated() {
	const noteListQuery = useNoteListCreatedQuery();

	if (!noteListQuery.isSuccess) {
		return <Spinner />;
	}

	return <SidebarList slugs={noteListQuery.data} />;
}
