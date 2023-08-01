import fontColorContrast from "font-color-contrast";

export function Cursor(props: { name: string; color: string }) {
	// TODO: prevent selection of name

	const colorContrast = fontColorContrast(props.color);

	return (
		<div className="pointer-events-none absolute -top-6 left-[-1px] select-none text-xs">
			<div
				style={{ backgroundColor: props.color, color: colorContrast }}
				className="rounded-box box-content flex select-none items-center gap-1 whitespace-nowrap rounded-bl-none px-2 py-1 text-primary-content opacity-90"
			>
				<div className="select-none opacity-50">{props.name}</div>
			</div>
		</div>
	);
}
