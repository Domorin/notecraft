import classNames from "classnames";

export function Spinner(props: { size?: "xs" | "sm" | "md" | "lg" | "xl" }) {
	const size = props.size ?? "md";

	return (
		<div className="flex h-full w-full items-center">
			<div
				className={classNames(
					"loading loading-bars mx-auto text-primary",
					{
						"loading-sm": size === "xs",
						"loading-md": size === "sm",
						"loading-lg": size === "lg",
						"loading-xl": size === "xl",
					}
				)}
			></div>
		</div>
	);
}
