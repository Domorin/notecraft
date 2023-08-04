import dynamic from "next/dynamic";
import { useNoteListCreatedQuery } from "../../hooks/trpc/use_note_list_created_query";
import { Spinner } from "../spinner";
import { ListType } from "./sidebar";
import { SidebarList } from "./sidebar_list";

// Disable SSR because this directly uses local storage
const SidebarListRecentsNoSSR = dynamic(
	() => import("./sidebar_list_recents"),
	{ ssr: false }
);

export function SidebarListNotes(props: { active: ListType }) {
	switch (props.active) {
		case "Created":
			return <SidebarListCreated />;
		case "Recents":
			return <SidebarListRecentsNoSSR />;
		default:
			throw new Error("hi");
	}
}

function SidebarListCreated() {
	const noteListQuery = useNoteListCreatedQuery();

	if (!noteListQuery.isSuccess) {
		return <Spinner />;
	}

	return <SidebarList slugs={noteListQuery.data} />;
}
