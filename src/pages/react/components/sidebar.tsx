import { trpc } from "@/utils/trpc";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import classNames from "classnames";
import { DateTime } from "luxon";
import Link from "next/link";
import { useRouter } from "next/router";
import { usePageSlug } from "../hooks/use_page_id";
import { Spinner } from "./spinner";
import { useNoteListCreatedQuery } from "../hooks/trpc/use_note_list_created_query";
import { Suspense, useState } from "react";
import { ListType } from "@/server/routers/note";
import { useNoteListRecent } from "../hooks/use_recent_local_storage";
import { useNoteListRecentsQuery } from "../hooks/trpc/use_note_list_recents_query";

function SidebarListNotes(props: { active: ListType }) {
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
	const query = useNoteListRecentsQuery();

	if (!query.isSuccess) {
		return <Spinner />;
	}

	return <SidebarList slugs={query.data} />;
}

function SidebarListCreated() {
	const noteListQuery = useNoteListCreatedQuery();

	if (!noteListQuery.isSuccess) {
		return <Spinner />;
	}

	return <SidebarList slugs={noteListQuery.data} />;
}

function SidebarList(props: { slugs: string[] }) {
	const currentSlug = usePageSlug();
	return (
		<ul className="menu w-full p-0">
			{props.slugs.map((val) => (
				<li key={val} className="w-full">
					<SidebarElement slug={val} active={currentSlug === val} />
				</li>
			))}
		</ul>
	);
}

export function Sidebar() {
	const [currentList, setCurrentList] = useState("Created" as ListType);
	const router = useRouter();

	return (
		<div className="flex h-full w-full flex-col border-r border-neutral">
			<div className="flex flex-col items-center border-b border-neutral">
				<div className="flex w-full min-w-0">
					<ListButton
						type="Created"
						currentList={currentList}
						setCurrentList={setCurrentList}
					/>
					<ListButton
						type="Viewed"
						currentList={currentList}
						setCurrentList={setCurrentList}
					/>
				</div>
			</div>
			<div className="h-full w-full overflow-auto">
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

function ListButton(props: {
	type: ListType;
	currentList: ListType;
	setCurrentList: (type: ListType) => void;
}) {
	return (
		<button
			className={classNames("btn-ghost btn-sm btn flex-1 rounded-none", {
				"btn-active": props.type === props.currentList,
			})}
			onClick={() => props.setCurrentList(props.type)}
		>
			{props.type}
		</button>
	);
}

function SidebarElement(props: { slug: string; active: boolean }) {
	const metadataQuery = trpc.note.metadata.useQuery({
		slug: props.slug,
	});

	const metadata = metadataQuery.data;

	// If the metadata query cache is not already populated, then something went wrong
	if (!metadataQuery.isSuccess || !metadata) {
		return <></>;
	}

	const updatedAt = DateTime.fromISO(metadata.updatedAt);
	const updatedAtDiffNow = Math.abs(updatedAt.diffNow().toMillis());

	return (
		<Link
			className={classNames(
				"flex w-full flex-col items-start whitespace-nowrap rounded-none",
				{
					active: props.active,
				}
			)}
			title={props.slug}
			href={`/${props.slug}`}
		>
			<span className="w-full overflow-hidden overflow-ellipsis">
				{props.slug}
			</span>
			<div
				className="ml-auto text-xs leading-3 opacity-50"
				suppressHydrationWarning
			>
				{`${
					updatedAtDiffNow < 1000 * 60
						? "less than a minute ago"
						: updatedAt.toRelative({
								round: true,
						  })
				}`}
			</div>
		</Link>
	);
}
