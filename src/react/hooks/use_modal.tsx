import { useRef, useCallback, ComponentProps } from "react";
import { Modal } from "../components/modal";

export function useModal() {
	const ref = useRef<HTMLDialogElement>(null);

	const handleShow = useCallback(() => {
		ref.current?.showModal();
	}, [ref]);

	const Dialog = ({
		children,
		...props
	}: Omit<ComponentProps<typeof Modal>, "ref">) => {
		return (
			<Modal {...props} ref={ref}>
				{children}
			</Modal>
		);
	};

	return { Dialog, handleShow };
}
