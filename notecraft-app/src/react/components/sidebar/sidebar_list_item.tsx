import classNames from "classnames";
import Link from "next/link";
import { useState } from "react";
import { useNoteMetadataQuery } from "../../hooks/trpc/use_note_metadata_query";
import { getNoteTitle } from "../../utils/get_note_title";
import { SidebarElementMenu } from "./note_menu/note_menu";
import { SidebarElementTitleInput } from "./sidebar_element_title_input";

export function SidebarListItem(props: { slug: string; active: boolean }) {
	const metadataQuery = useNoteMetadataQuery(props.slug);

	const metadata = metadataQuery.data;

	const [showInput, setShowInput] = useState(false);

	// If the metadata query cache is not already populated, then something went wrong
	if (!metadataQuery.isSuccess || !metadata) {
		return <></>;
	}

	const pageTitle = getNoteTitle(metadata);

	return (
		<span
			className={classNames(
				"group flex w-full min-w-0 items-center whitespace-nowrap rounded-none text-sm",
				{
					"bg-primary text-primary-content": props.active,
					"hover:bg-base-content hover:bg-opacity-10": !props.active,
				}
			)}
		>
			{showInput ? (
				<div className="px-4 py-2">
					<SidebarElementTitleInput
						metadata={metadata}
						closeInput={() => setShowInput(false)}
					/>
				</div>
			) : (
				<Link
					className="flex w-full items-center px-4 py-2"
					title={pageTitle}
					href={`/${props.slug}`}
					shallow
				>
					<div className="overflow-hidden overflow-ellipsis">
						{pageTitle}
					</div>
					<SidebarElementMenu
						metadata={metadata}
						openTitleInput={() => setShowInput(true)}
					/>
				</Link>
			)}
		</span>
	);
}
