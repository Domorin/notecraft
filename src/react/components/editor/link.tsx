import {
	NodeView,
	NodeViewContent,
	NodeViewProps,
	NodeViewWrapper,
} from "@tiptap/react";
import { useState } from "react";
import { ModalLinkInput } from "../modals/modal_link_input";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faEdit,
	faPencil,
	faPencilAlt,
} from "@fortawesome/free-solid-svg-icons";
import classNames from "classnames";
import { useModal } from "@/react/hooks/use_modal";

export function CustomLinkComponent(props: NodeViewProps) {
	const { isOpen, openModal } = useModal("EditorLinkInput");
	return (
		<NodeViewWrapper
			className={classNames(
				"dropdown-top dropdown-hover dropdown inline-block w-fit p-0",
				{
					"dropdown-open": isOpen,
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
