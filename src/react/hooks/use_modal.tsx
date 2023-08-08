import {
	ComponentProps,
	FC,
	ReactNode,
	createContext,
	useCallback,
	useContext,
	useState,
} from "react";
import { ModalLinkInput } from "../components/modals/modal_link_input";

export const ModalContext = createContext({
	openModal: (component: ReactNode) => {},
	closeModal: () => {},
});

const ValidModals = {
	EditorLinkInput: ModalLinkInput,
} satisfies Record<string, FC<any>>;

export function useModal<T extends keyof typeof ValidModals>(component: T) {
	const { openModal, closeModal } = useContext(ModalContext);
	const [isOpen, setIsOpen] = useState(false);

	const closeModalCallback = useCallback(() => {
		setIsOpen(false);
		closeModal();
	}, [closeModal]);

	return {
		isOpen,
		openModal: useCallback(
			(
				props: Omit<
					ComponentProps<(typeof ValidModals)[T]>,
					"closeModal"
				>
			) => {
				setIsOpen(true);
				openModal(
					ValidModals[component]({
						...props,
						closeModal: closeModalCallback,
					})
				);
			},
			[component]
		),
		closeModal: closeModalCallback,
	};
}

export function useCloseModal() {
	const { closeModal } = useContext(ModalContext);
	return closeModal;
}
