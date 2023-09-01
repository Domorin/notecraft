import {
	ComponentProps,
	FC,
	ReactNode,
	createContext,
	useCallback,
	useContext,
	useState,
} from "react";
import { EditorLinkInputModal } from "../components/modals/editor_link_input_modal";
import { LoginModal } from "../components/modals/login_modal";
import { SettingsModal } from "../components/modals/settings_modal";
import { EditorImageInputModal } from "../components/modals/editor_image_input_modal";

export const ModalContext = createContext({
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	openModal: (component: ReactNode) => {},
	closeModal: () => {},
});

const ValidModals = {
	EditorLinkInput: EditorLinkInputModal,
	EditorImageInput: EditorImageInputModal,
	Login: LoginModal,
	Settings: SettingsModal,
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
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

				const Modal = ValidModals[component];

				openModal(
					// @ts-expect-error - Not bothering fixing this right now
					<Modal {...props} closeModal={closeModalCallback} />
				);
			},
			[closeModalCallback, component, openModal]
		),
		closeModal: closeModalCallback,
	};
}

export function useCloseModal() {
	const { closeModal } = useContext(ModalContext);
	return closeModal;
}
