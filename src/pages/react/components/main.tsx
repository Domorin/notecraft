import { LoadableNote } from "./note";
import { Sidebar } from "./sidebar";
import { ThemePicker } from "./theme_picker";

export default function MainPage() {
	return (
		<div className="flex h-screen items-center justify-center bg-base-300">
			<ThemePicker />
			<div className="rounded-box flex h-3/4 w-3/4 overflow-hidden border-2 border-neutral shadow-lg">
				<div className="rounded-l-box w-1/6 bg-base-200">
					<Sidebar />
				</div>
				<div className="rounded-r-box flex-grow-0 w-5/6 bg-base-100 p-8">
					<LoadableNote />
				</div>
			</div>
		</div>
	);
}
