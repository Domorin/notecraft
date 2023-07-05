import { trpc } from "@/utils/trpc";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import classNames from "classnames";
import { DateTime } from "luxon";
import Link from "next/link";
import { useRouter } from "next/router";
import { usePageSlug } from "../hooks/use_page_id";
import { Spinner } from "./spinner";
import { useNoteListCreatedQuery } from "../hooks/trpc/use_note_list_created";

export function Sidebar() {
	const listQuery = useNoteListCreatedQuery();
	const router = useRouter();
	const currentSlug = usePageSlug();

	if (!listQuery.isSuccess) {
		return <Spinner />;
	}

	return (
		<div className="flex h-full w-full flex-col border-r border-neutral">
			<div className="flex flex-col items-center border-b border-neutral">
				<button
					className="btn-ghost btn w-full rounded-none"
					onClick={() => router.push("/")}
				>
					<FontAwesomeIcon icon={faPlus} />
					New Note
				</button>
			</div>
			<div className="h-full w-full overflow-auto">
				<ul className="menu w-full p-0">
					{listQuery.data.map((val) => (
						<li key={val} className="w-full">
							<SidebarElement
								slug={val}
								active={currentSlug === val}
							/>
						</li>
					))}
				</ul>
			</div>
		</div>
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
				"flex w-full flex-col items-start whitespace-nowrap",
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
				{updatedAtDiffNow < 1000 * 60
					? "Less than a minute ago"
					: updatedAt.toRelative({
							round: true,
					  })}
			</div>
		</Link>
	);
}
