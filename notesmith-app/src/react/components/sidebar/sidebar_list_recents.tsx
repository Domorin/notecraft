import { useNoteListRecentsQuery } from "../../hooks/trpc/use_note_list_recents_query";
import { Spinner } from "../spinner";
import { SidebarList } from "./sidebar_list";

export default function SidebarListRecents() {
	const { isLoading, queries } = useNoteListRecentsQuery();

	if (isLoading) {
		return <Spinner />;
	}

	return <SidebarList slugs={queries} />;
}
