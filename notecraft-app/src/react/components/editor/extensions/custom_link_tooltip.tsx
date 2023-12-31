import { useAttachChildToParent } from "@/react/hooks/use_attach_child_to_parent";
import { faPencilAlt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import classNames from "classnames";
import { useRef } from "react";
import { createPortal } from "react-dom";

export function LinkTooltip(props: {
	label: string;
	onClick: () => void;
	parentRef: HTMLAnchorElement;
	onMouseLeave: () => void;
}) {
	const childRef = useRef<HTMLDivElement>(null);
	const parentRef = useRef(props.parentRef);

	useAttachChildToParent(parentRef, childRef, (parent, _child) => {
		return {
			relativeX: 0,
			relativeY: -parent.height,
		};
	});

	return (
		<>
			{createPortal(
				<div
					onMouseLeave={props.onMouseLeave}
					className="absolute z-[100] w-fit"
					ref={childRef}
					onClick={props.onClick}
				>
					<ul
						className={classNames(
							"dropdown-content menu menu-xs bg-base-200 visible max-w-xs whitespace-nowrap p-0 shadow"
						)}
					>
						<li className="flex w-full">
							<div className="flex w-full items-center gap-2">
								<span className="max-w-[91.666667%] overflow-hidden overflow-ellipsis">
									{props.label}
								</span>
								<FontAwesomeIcon icon={faPencilAlt} />
							</div>
						</li>
					</ul>
				</div>,
				document.body
			)}
		</>
	);
}
