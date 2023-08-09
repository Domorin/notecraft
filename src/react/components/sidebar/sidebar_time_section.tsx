import classNames from "classnames";
import { usePageSlug } from "../../hooks/use_page_id";
import { SidebarListItem } from "./sidebar_list_item";

export function SidebarTimeSection(props: { title: string; slugs: string[] }) {
	const currentSlug = usePageSlug();

	return (
		<>
			{props.slugs.length > 0 && (
				<>
					<li
						className={classNames(
							"sticky top-0 bg-base-200 px-4 py-2 text-xs font-bold"
						)}
					>
						<span className="opacity-40">{props.title}</span>
					</li>
					{props.slugs.map((val) => (
						<li key={val} className="w-full">
							<SidebarListItem
								slug={val}
								active={currentSlug === val}
							/>
						</li>
					))}
				</>
			)}
		</>
	);
}