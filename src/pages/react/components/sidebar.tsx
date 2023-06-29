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

export function Sidebar() {
	const [slugs, query] = trpc.getAllSlugs.useSuspenseQuery();
	const router = useRouter();

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
						className={classNames({
							active: currentSlug === val.slug,
						})}
					>
						<Link
							className="flex flex-col items-start"
							href={`/${val.slug}`}
						>
							{val.slug}
							<div
								className="ml-auto text-xs opacity-50"
								suppressHydrationWarning
							>
								{DateTime.fromISO(val.updatedAt).toRelative()}
							</div>
						</Link>
					</li>
				))}
			</ul>
		</div>
	);
}
