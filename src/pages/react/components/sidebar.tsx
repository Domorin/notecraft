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

	if (!listQuery.isSuccess) {
		return <Spinner />;
	}

	const slugs = listQuery.data.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

	const currentSlug = usePageSlug();

	return (
		<div className="flex flex-col">
			<button className="btn-ghost btn" onClick={() => router.push("/")}>
				<FontAwesomeIcon icon={faPlus} />
				New Note
			</button>
			<ul className="menu p-0">
				{slugs.map((val) => (
					<li
						key={val.slug}						
					>
						<SidebarElement slug={val.slug} active={currentSlug === val.slug} />
					</li>
				))}
			</ul>
		</div>
	);
}

function SidebarElement(props: { slug: string; active: boolean; }) {
	const metadata = useGetNoteMetadata(props.slug);
	

	if(!metadata) {
		return <div>Invalid Page</div>
	}

	return (
		<Link className={classNames("flex flex-col items-start", {
			active: props.active,
		})} href={`/${props.slug}`}>
			{props.slug}
			<div
				className="ml-auto text-xs opacity-50"
				suppressHydrationWarning
			>
				{metadata.updatedAt &&
					DateTime.fromISO(metadata.updatedAt).toRelative()}
			</div>
		</Link>
	);
}
