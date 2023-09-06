import classNames from "classnames";
import { ListType } from "./sidebar";

export function SidebarListViewButton(props: {
	type: ListType;
	currentList: ListType;
	setCurrentList: (type: ListType) => void;
	isFirst?: boolean;
}) {
	return (
		<button
			className={classNames(
				"btn-sm btn relative box-border w-1/2 rounded-r-none rounded-bl-none",
				{
					"btn-primary btn-active": props.type === props.currentList,
					"rounded-r-none rounded-bl-none rounded-tl-[calc(var(--rounded-box)-2px)]":
						props.isFirst,
					// -2px for border width of parent https://www.30secondsofcode.org/css/s/nested-border-radius/
					"rounded-none": !props.isFirst,
				}
			)}
			onClick={() => props.setCurrentList(props.type)}
		>
			{props.type}
		</button>
	);
}
