import { trpc } from "@/utils/trpc";
import { SignedInStatus } from "../login/login_button";
import ThemePicker from "../theme_picker";

export function Navbar() {
	const userInfoQuery = trpc.user.info.useQuery();

	if (!userInfoQuery.isSuccess) {
		return undefined;
	}

	return (
		<div className="min-h-12 flex h-12 w-full items-center">
			<div className="mx-2 ml-auto flex items-center gap-2">
				{!userInfoQuery.data.isLoggedIn && <ThemePicker />}
				<SignedInStatus userInfo={userInfoQuery.data} />
			</div>
		</div>
	);
}
