import { trpc } from "@/utils/trpc";
import { SignedInStatus } from "../login/login_button";
import ThemePicker from "../theme_picker";

export function Navbar() {
	const userInfoQuery = trpc.user.info.useQuery();

	if (!userInfoQuery.isSuccess) {
		return undefined;
	}

	return (
		<div>
			<div className="absolute right-4 top-2 flex items-center gap-2">
				{!userInfoQuery.data.isLoggedIn && <ThemePicker />}
				<SignedInStatus userInfo={userInfoQuery.data} />
			</div>
		</div>
	);
}
