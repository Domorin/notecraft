import { useSession } from "@/react/hooks/use_session";
import { SignedInStatus } from "../login/login_button";
import ThemePicker from "../theme_picker";

export function Navbar() {
	const session = useSession();

	return (
		<div className="min-h-12 flex h-12 w-full items-center">
			<div className="mx-2 ml-auto flex items-center gap-2">
				{!session && <ThemePicker />}
				<SignedInStatus session={session} />
			</div>
		</div>
	);
}
