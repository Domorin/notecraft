import { useModal } from "@/react/hooks/use_modal";
import { useAttachChildToParent } from "@/react/hooks/use_relative_position";
import { faPencilAlt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { NodeViewProps, NodeViewWrapper } from "@tiptap/react";
import classNames from "classnames";
import { useRef, useState } from "react";
import { createPortal } from "react-dom";

export function CustomLinkComponent(props: NodeViewProps) {
	const { isOpen, openModal } = useModal("EditorLinkInput");

	const [labelHovered, setLabelHovered] = useState(false);
	const [tooltipHovered, setTooltipHovered] = useState(false);

	const isHovered = labelHovered || tooltipHovered;

	const parentRef = useRef<HTMLSpanElement>(null);
	const childRef = useRef<HTMLDivElement>(null);

	useAttachChildToParent(parentRef, childRef, (parent, child) => {
		return {
			relativeX: parent.width / 2 - child.width / 2,
			relativeY: -parent.height,
		};
	});

	return (
		<NodeViewWrapper
			ref={parentRef}
			className={classNames(
				"dropdown-top dropdown-hover dropdown inline-block w-fit p-0 hover:dropdown-open"
			)}
		>
			<a
				onMouseEnter={() => {
					setLabelHovered(true);
				}}
				onMouseLeave={() => {
					setLabelHovered(false);
				}}
				className="w-fit"
				href={props.node.attrs.href}
				title={props.node.attrs.href}
			>
				{props.node.attrs.title}
			</a>
			{createPortal(
				<div
					className="absolute z-[1] w-fit"
					onMouseEnter={() => {
						setTooltipHovered(true);
					}}
					onMouseLeave={() => {
						setTooltipHovered(false);
					}}
					ref={childRef}
					onClick={() =>
						openModal({
							initialHref: props.node.attrs.href,
							initialTitle: props.node.attrs.title,
							onSubmit: (opts) => {
								props.updateAttributes(opts);
							},
						})
					}
				>
					<ul
						className={classNames(
							"dropdown-content menu menu-xs max-w-xs whitespace-nowrap bg-base-200 p-0 shadow",
							{
								invisible: !isHovered,
								visible: isHovered,
							}
						)}
					>
						<li className="flex w-full">
							<div className="flex w-full items-center gap-2">
								<span className="max-w-[91.666667%] overflow-hidden overflow-ellipsis">
									{props.node.attrs.href}
								</span>
								<FontAwesomeIcon icon={faPencilAlt} />
							</div>
						</li>
					</ul>
				</div>,
				document.body
			)}
		</NodeViewWrapper>
	);

	// return (
	// 	<NodeViewWrapper className="inline-block w-fit">
	// 		<div
	// 			className={classNames(
	// 				"dropdown-top dropdown-hover dropdown p-0",
	// 				{ "dropdown-open": isModalActive }
	// 			)}
	// 		>
	// 			<a
	// 				className="w-fit"
	// 				href={props.node.attrs.href}
	// 				title={props.node.attrs.href}
	// 			>
	// 				{props.node.attrs.title}
	// 			</a>
	// 			<ul
	// 				tabIndex={0}
	// 				className="dropdown-content menu menu-xs z-[1] w-fit max-w-xs whitespace-nowrap bg-base-200 p-0 shadow"
	// 			>
	// 				<li
	// 					className="flex w-full"
	// 					onClick={() => setModalActive(true)}
	// 				>
	// 					<div className="flex w-full items-center gap-2">
	// 						<span className="max-w-[91.666667%] overflow-hidden overflow-ellipsis">
	// 							{props.node.attrs.href}
	// 						</span>
	// 						<FontAwesomeIcon icon={faPencilAlt} />
	// 					</div>
	// 				</li>
	// 			</ul>
	// 		</div>
	// 		<ModalLinkInput
	// 			initialTitle={props.node.attrs.title}
	// 			initialHref={props.node.attrs.href}
	// 			onSubmit={(href, title) => {
	// 				props.updateAttributes({ href, title });
	// 			}}
	// 			isActive={isModalActive}
	// 			close={() => setModalActive(false)}
	// 		/>
	// 	</NodeViewWrapper>
	// );
}
