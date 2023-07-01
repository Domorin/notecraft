import { trpc } from "@/utils/trpc";
import Link from "next/link";
import { usePageSlug } from "../hooks/use_page_id";
import classNames from "classnames";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faClockRotateLeft,
	faPen,
	faPlus,
} from "@fortawesome/free-solid-svg-icons";
import { useRouter } from "next/router";
import { DateTime } from "luxon";
import { Spinner } from "./spinner";
import { useGetNoteMetadata } from "../hooks/trpc/use_note_metadata";

export function Sidebar() {
	const listQuery = trpc.note.list.useQuery();
	const router = useRouter();
	const currentSlug = usePageSlug();

	if (!listQuery.isSuccess) {
		return <Spinner />;
	}

	const slugs = listQuery.data.sort(
		(a, b) =>
			new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
	);

	return (
		<div className="flex h-full w-full flex-col border-r border-neutral">
			<div className="border-b border-neutral flex items-center flex-col">
			<button className="btn-ghost btn w-full rounded-none" onClick={() => router.push("/")}>
				<FontAwesomeIcon icon={faPlus} />
				New Note
			</button>
			</div>
			<div className="h-full w-full overflow-auto">
				<ul className="menu w-full p-0">
					{slugs.map((val) => (
						<li key={val.slug} className="w-full">
							<SidebarElement
								slug={val.slug}
								active={currentSlug === val.slug}
							/>
						</li>
					))}
				</ul>
			</div>
		</div>
	);
}

function SidebarElement(props: { slug: string; active: boolean }) {
	const metadata = useGetNoteMetadata(props.slug);

	if (!metadata) {
		return <div>Invalid Page</div>;
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
							unit: [
								"years",
								"months",
								"hours",
								"days",
								"weeks",
								"minutes",
							],
					  })}
			</div>
		</Link>
	);
}
