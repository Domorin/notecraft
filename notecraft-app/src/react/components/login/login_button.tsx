import { useModal } from "@/react/hooks/use_modal";

export function LoginButton() {
	// const router = useRouter();
	const modal = useModal("Login");

	return (
		<button className="btn btn-ghost" onClick={() => modal.openModal({})}>
			Login
		</button>
	);
}
