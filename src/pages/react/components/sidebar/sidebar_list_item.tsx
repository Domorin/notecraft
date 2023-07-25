import { trpc } from "@/utils/trpc";
import classNames from "classnames";
import Link from "next/link";
import { useState } from "react";
import { SidebarElementMenu } from "./sidebar_element_menu";
import { SidebarElementTitleInput } from "./sidebar_element_title_input";
import { getNoteTitle } from "../../utils/get_note_title";

export function SidebarListItem(props: { slug: string; active: boolean }) {
	const metadataQuery = trpc.note.metadata.useQuery({
		slug: props.slug,
	});

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
					"bg-neutral text-neutral-content": props.active,
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
