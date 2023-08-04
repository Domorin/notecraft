import classNames from "classnames";
import { Spinner } from "./spinner";

export function MutationButton(props: {
	children: React.ReactNode;
	onClick: () => void;
	isLoading: boolean;
}) {
	return (
		<button
			onClick={props.onClick}
			disabled={props.isLoading}
			className={classNames("btn-primary btn bg-black")}
		>
			{props.isLoading ? (
				<span className="loading loading-spinner"></span>
			) : null}
			{props.children}
		</button>
	);
}
