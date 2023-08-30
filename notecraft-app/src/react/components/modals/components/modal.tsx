import React from "react";

export type BaseModalProps = {
	closeModal: () => void;
};

export const Modal = (
	props: BaseModalProps & { children: React.ReactNode }
) => {
	return (
		<div>
			<dialog className="modal modal-open">
				<form
					method="dialog"
					className="modal-box bg-base-200 border-neutral w-fit border pb-4"
				>
					{props.children}
				</form>
				<form method="dialog" className="modal-backdrop">
					<button onClick={props.closeModal}>close</button>
				</form>
			</dialog>
		</div>
	);
};
