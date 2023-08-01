import classNames from "classnames";
import type { UserPresence } from "../../../../../ws/server/types";
import fontColorContrast from "font-color-contrast";

export function Presences(props: {
	presences: UserPresence[];
	clientId: number;
}) {
	return (
		<div className="avatar-group -space-x-3 overflow-visible">
			{props.presences
				.map((val) => <UserPresence key={val.name} user={val} />)
				.slice(0, 5)}
			{props.presences.length > 5 && (
				<Presence name={`+${props.presences.length - 5}`} />
			)}
		</div>
	);
}
export function Presence(props: {
	name: string;
	tooltip?: string;
	color?: string;
	className?: string;
}) {
	const colorContrast = props.color
		? fontColorContrast(props.color)
		: undefined;
	return (
		<div
			className="placeholder avatar tooltip overflow-visible border-2 border-neutral-focus"
			data-tip={props.tooltip}
		>
			<div
				className={classNames("w-8 overflow-hidden rounded-full", {
					"bg-neutral text-neutral-content": !props.color,
				})}
				style={
					props.color
						? { backgroundColor: props.color, color: colorContrast }
						: undefined
				}
			>
				<span className="text-sm font-bold opacity-70">
					{props.name}
				</span>
			</div>
		</div>
	);
}

function UserPresence(props: { user: UserPresence }) {
	const letters = props.user.name.split(" ").map((val) => val[0]);

	return (
		<Presence
			name={letters.join("")}
			color={props.user.color}
			tooltip={props.user.name}
		/>
	);
}
