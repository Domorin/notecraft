import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { BaseModalProps, Modal } from "./components/modal";
import { ModalHeader } from "./components/modal_header";
import { faGoogle } from "@fortawesome/free-brands-svg-icons";
import { useRouter } from "next/router";

export function LoginModal(props: BaseModalProps) {
	const router = useRouter();

	return (
		<Modal closeModal={props.closeModal}>
			<ModalHeader>Sign In</ModalHeader>
			<button
				className="btn btn-primary flex w-96 items-center gap-2"
				onClick={() => router.push("/api/auth/login/google")}
			>
				<FontAwesomeIcon className="text-lg" icon={faGoogle} />
				Continue with Google
			</button>
		</Modal>
	);
}
