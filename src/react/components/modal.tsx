import React, { ComponentProps, forwardRef } from "react";
import { useModal } from "../hooks/use_modal";

export type BaseModalProps = {
	closeModal: () => void;
};

export const Modal = (
	props: BaseModalProps & { children: React.ReactNode }
) => {
	return (
		<div>
			<dialog className="modal modal-open">
				{props.children}
				<form method="dialog" className="modal-backdrop">
					<button onClick={props.closeModal}>close</button>
				</form>
			</dialog>
		</div>
	);
};
