import React, { useRef, useCallback, ComponentProps } from "react";
import { Modal } from "../components/modal";

export function useModal<T>() {
	// const ref = useRef<HTMLDialogElement>(null);
	// const modalCounter = useRef(0);
	// const handleShow = useCallback(
	// 	(props: T) => {
	// 		ref.current?.showModal();
	// 	},
	// 	[ref]
	// );
	// const Dialog = useCallback(
	// 	({ children, ...props }: ComponentProps<typeof Modal>) => {
	// 		return (
	// 			<Modal {...props} ref={ref}>
	// 				<React.Fragment>{children}</React.Fragment>
	// 			</Modal>
	// 		);
	// 	},
	// 	[ref]
	// );
	// return { Dialog, handleShow };
}
