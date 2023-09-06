import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { BaseModalProps, Modal } from "./components/modal";
import { ModalHeader } from "./components/modal_header";
import { faDiscord, faGoogle } from "@fortawesome/free-brands-svg-icons";
import { useRouter } from "next/router";

export function LoginModal(props: BaseModalProps) {
	const router = useRouter();

	return (
		<Modal closeModal={props.closeModal}>
			<ModalHeader>Sign In</ModalHeader>
			<div className="flex w-full flex-col gap-2 text-left">
				<button
					className="btn btn-primary flex items-center justify-start gap-2 px-16"
					onClick={() => router.push("/api/auth/login/google")}
				>
					<FontAwesomeIcon className="w-6 text-lg" icon={faGoogle} />
					Continue with Google
				</button>
				<button
					className="btn btn-primary flex items-center justify-start gap-2 px-16"
					onClick={() => router.push("/api/auth/login/discord")}
				>
					<FontAwesomeIcon className="w-6 text-lg" icon={faDiscord} />
					Continue with Discord
				</button>
			</div>
		</Modal>
	);
}
