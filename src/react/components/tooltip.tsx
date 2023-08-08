import { faPencilAlt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { NodeViewWrapper } from "@tiptap/react";
import classNames from "classnames";
import { createPortal } from "react-dom";

export function Tooltip() {
	return (
		<NodeViewWrapper
			className={classNames(
				"dropdown-top dropdown-hover dropdown inline-block w-fit p-0",
				{
					"dropdown-open": isOpen || true,
				}
			)}
		>
			<a
				onClick={() =>
					openModal({
						initialHref: props.node.attrs.href,
						initialTitle: props.node.attrs.title,
						onSubmit: (opts) => {
							props.updateAttributes(opts);
						},
					})
				}
				className="w-fit"
				// href={props.node.attrs.href}
				title={props.node.attrs.href}
			>
				{props.node.attrs.title}
			</a>
			{createPortal(
				<ul
					tabIndex={0}
					className="dropdown-content menu menu-xs z-[1] w-fit max-w-xs whitespace-nowrap bg-base-200 p-0 shadow"
				>
					<li className="flex w-full">
						<div className="flex w-full items-center gap-2">
							<span className="max-w-[91.666667%] overflow-hidden overflow-ellipsis">
								{props.node.attrs.href}
							</span>
							<FontAwesomeIcon icon={faPencilAlt} />
						</div>
					</li>
				</ul>,
				document.body
			)}
		</NodeViewWrapper>
	);
}
