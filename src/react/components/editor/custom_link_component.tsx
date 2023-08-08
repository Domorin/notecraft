import { useModal } from "@/react/hooks/use_modal";
import { useAttachChildToParent } from "@/react/hooks/use_relative_position";
import { faPencilAlt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { NodeViewProps, NodeViewWrapper } from "@tiptap/react";
import classNames from "classnames";
import { RefObject, useRef, useState } from "react";
import { createPortal } from "react-dom";

export function CustomLinkComponent(props: NodeViewProps) {
	const { isOpen, openModal } = useModal("EditorLinkInput");

	const [labelHovered, setLabelHovered] = useState(false);
	const [tooltipHovered, setTooltipHovered] = useState(false);

	const isHovered = labelHovered || tooltipHovered;

	const parentRef = useRef<HTMLSpanElement>(null);

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
			{isHovered && (
				<Tooltip
					label={props.node.attrs.href}
					setHovered={setTooltipHovered}
					onClick={() =>
						openModal({
							initialHref: props.node.attrs.href,
							initialTitle: props.node.attrs.title,
							onSubmit: (opts) => {
								props.updateAttributes(opts);
							},
						})
					}
					parentRef={parentRef}
				/>
			)}
		</NodeViewWrapper>
	);
}

function Tooltip(props: {
	label: string;
	onClick: () => void;
	parentRef: RefObject<HTMLSpanElement>;
	setHovered: (hovered: boolean) => void;
}) {
	const childRef = useRef<HTMLDivElement>(null);

	useAttachChildToParent(props.parentRef, childRef, (parent, child) => {
		return {
			relativeX: parent.width / 2 - child.width / 2,
			relativeY: -parent.height,
		};
	});

	return (
		<>
			{createPortal(
				<div
					onMouseEnter={() => {
						props.setHovered(true);
					}}
					onMouseLeave={() => {
						props.setHovered(false);
					}}
					className="absolute z-[1] w-fit px-8 pb-2"
					ref={childRef}
					onClick={props.onClick}
				>
					<ul
						className={classNames(
							"dropdown-content menu menu-xs visible max-w-xs whitespace-nowrap bg-base-200 p-0 shadow"
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
