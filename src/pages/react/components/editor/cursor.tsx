export function Cursor(props: { name: string; color: string }) {
	// TODO: prevent selection of name
	return (
		<div className="pointer-events-none absolute -top-6 left-[-1px] select-none text-xs">
			<div
				style={{ backgroundColor: props.color }}
				className="rounded-box box-content flex select-none items-center gap-1 whitespace-nowrap rounded-bl-none px-2 py-1 text-primary-content opacity-90"
			>
				<div className="select-none">{props.name}</div>
			</div>
		</div>
	);
}
