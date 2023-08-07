import React, { ComponentProps, forwardRef } from "react";

export type ModalProps = Omit<ComponentProps<typeof Modal>, "children">;

export const Modal = (props: {
	children: React.ReactNode;
	isActive: boolean;
	close: () => void;
}) => {
	if (!props.isActive) return undefined;

	return (
		<div>
			<dialog className="modal modal-open">
				{props.children}
				<form method="dialog" className="modal-backdrop">
					<button onClick={props.close}>close</button>
				</form>
			</dialog>
		</div>
	);
};
