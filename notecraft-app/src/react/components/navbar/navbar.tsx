import { LoginButton } from "../login/login_button";
import ThemePicker from "../theme_picker";

export function Navbar() {
	return (
		<div className="absolute right-2 top-2 flex items-center">
			<LoginButton />
			<ThemePicker />
		</div>
	);
}
