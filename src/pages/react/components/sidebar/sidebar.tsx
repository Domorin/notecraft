import { ListType } from "@/server/routers/note";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { DateTime } from "luxon";
import { useRouter } from "next/router";
import { useState } from "react";
import { SidebarListViewButton } from "./sidebar_list_view_button";
import { SidebarListNotes } from "./sidebar_lists";

export function Sidebar() {
	const [currentList, setCurrentList] = useState("Created" as ListType);
	const router = useRouter();

	return (
		<div className="flex h-full w-full flex-col border-r border-neutral">
			<div className="flex flex-col items-center border-b border-neutral">
				<div className="flex w-full min-w-0">
					<SidebarListViewButton
						type="Created"
						currentList={currentList}
						setCurrentList={setCurrentList}
					/>
					<SidebarListViewButton
						type="Viewed"
						currentList={currentList}
						setCurrentList={setCurrentList}
					/>
				</div>
			</div>
			<div className="h-full w-full overflow-y-auto overflow-x-clip">
				<SidebarListNotes active={currentList} />
			</div>
			<div className="flex flex-col items-center border-t border-neutral">
				<button
					className="btn-primary btn w-full rounded-none"
					onClick={() => router.push("/")}
				>
					<FontAwesomeIcon icon={faPlus} />
					New Note
				</button>
			</div>
		</div>
	);
}
