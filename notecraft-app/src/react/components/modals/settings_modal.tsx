import { useNoteListRecent } from "@/react/hooks/use_recents";
import ThemePicker from "../theme_picker";
import { BaseModalProps, Modal } from "./components/modal";
import { ModalHeader } from "./components/modal_header";
import { trpc } from "@/utils/trpc";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGoogle } from "@fortawesome/free-brands-svg-icons";
import { useSignoutMutation } from "@/react/hooks/trpc/use_signout_mutation";

export function SettingsModal(props: BaseModalProps) {
	const { clear } = useNoteListRecent();
	const userInfoQuery = trpc.user.info.useQuery(undefined, {
		refetchOnMount: false,
	});

	const logoutMutation = useSignoutMutation();

	return (
		<Modal {...props}>
			<div className="w-96">
				<ModalHeader>Settings</ModalHeader>
				<div className="flex w-full flex-col gap-2">
					<div className="flex items-center">
						<div>Theme</div>
						<div className="ml-auto">
							<ThemePicker />
						</div>
					</div>
					<div className="divider my-0"></div>
					<div className="flex items-center">
						<div>Clear all recents</div>
						<div className="ml-auto">
							<button
								className="btn btn-error btn-sm"
								onClick={() => clear()}
							>
								Clear
							</button>
						</div>
					</div>
				</div>
				{userInfoQuery.data?.isLoggedIn && (
					<div className="ml-auto mt-12 flex w-fit items-center gap-1 text-sm">
						<FontAwesomeIcon icon={faGoogle} />
						<div>{userInfoQuery.data.user.name}</div>
						<div
							className="link link-error"
							onClick={() => logoutMutation.mutate()}
						>
							(sign out)
						</div>
					</div>
				)}
			</div>
		</Modal>
	);
}
