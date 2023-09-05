import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRouter } from "next/router";
import { createContext, useState } from "react";
import { useNoteMetadataQuery } from "../../hooks/trpc/use_note_metadata_query";
import { usePageSlug } from "../../hooks/use_page_id";
import { SidebarListViewButton } from "./sidebar_list_view_button";
import { SidebarListNotes } from "./sidebar_lists";

export type ListType = "Created" | "Recents";
export const SidebarActiveListContext = createContext<ListType>("Created");

export default function Sidebar() {
	const [currentList, setCurrentList] = useState("Created" as ListType);
	const router = useRouter();
	const slug = usePageSlug();

	const [currentSlug, setCurrentSlug] = useState(
		undefined as string | undefined
	);

	const metadata_query = useNoteMetadataQuery(slug!);

	// Update list view when slug changes
	if (metadata_query.data && currentSlug !== metadata_query.data.slug) {
		if (!metadata_query.data.isCreatedByYou) {
			setCurrentSlug(metadata_query.data.slug);
			setCurrentList("Recents");
		}
	}

	return (
		<div className="border-neutral flex h-full w-full flex-col border-r">
			<div className="border-neutral flex flex-col items-center border-b">
				<div className="flex w-full min-w-0">
					<SidebarListViewButton
						type="Created"
						currentList={currentList}
						setCurrentList={setCurrentList}
					/>
					<SidebarListViewButton
						type="Recents"
						currentList={currentList}
						setCurrentList={setCurrentList}
					/>
				</div>
			</div>
			<div className="h-full w-full overflow-y-auto overflow-x-clip">
				<SidebarActiveListContext.Provider value={currentList}>
					<SidebarListNotes active={currentList} />
				</SidebarActiveListContext.Provider>
			</div>
			<div className="border-neutral flex flex-col items-center border-t">
				<button
					className="btn-primary btn w-full rounded-none"
					onClick={() =>
						router.push("/new", undefined, { shallow: true })
					}
				>
					<FontAwesomeIcon icon={faPlus} />
					New Note
				</button>
			</div>
		</div>
	);
}
