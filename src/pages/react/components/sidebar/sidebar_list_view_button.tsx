import classNames from "classnames";
import { ListType } from "./sidebar";

export function SidebarListViewButton(props: {
	type: ListType;
	currentList: ListType;
	setCurrentList: (type: ListType) => void;
}) {
	return (
		<button
			className={classNames("btn-sm btn flex-1 rounded-none", {
				"btn-primary": props.type === props.currentList,
			})}
			onClick={() => props.setCurrentList(props.type)}
		>
			{props.type}
		</button>
	);
}
