import { UserPresence } from "@notecraft/common/build/src/ws_types";
import classNames from "classnames";
import fontColorContrast from "font-color-contrast";

export function Presences(props: {
	presences: UserPresence[];
	clientId: number;
}) {
	const sortedPresences = props.presences.sort(
		(a, b) => b.connectedMs - a.connectedMs
	);

	return (
		<div className="avatar-group -space-x-3 overflow-visible">
			{sortedPresences
				.map((val) => <UserPresenceIcon key={val.name} user={val} />)
				.slice(0, 5)}
			{sortedPresences.length > 5 && (
				<Presence name={`+${sortedPresences.length - 5}`} />
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
			className="placeholder avatar tooltip border-neutral-focus overflow-visible border-2"
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

function UserPresenceIcon(props: { user: UserPresence }) {
	const letters = props.user.name.split(" ").map((val) => val[0]);

	return (
		<Presence
			name={letters.join("")}
			color={props.user.color}
			tooltip={props.user.name + (props.user.isYou ? " (You)" : "")}
		/>
	);
}
