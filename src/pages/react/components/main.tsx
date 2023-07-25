import { LoadableNote } from "./note";
import { Sidebar } from "./sidebar/sidebar";
import { ThemePicker } from "./theme_picker";

export default function MainPage() {
	return (
		<div className="flex h-screen items-center justify-center bg-base-300">
			<ThemePicker />
			<div className="rounded-box m-12 flex h-3/4 overflow-hidden border-2 border-neutral shadow-lg">
				<div className="rounded-l-box w-[12rem] bg-base-200">
					<Sidebar />
				</div>
				<div className="rounded-r-box w-[64rem] flex-grow-0 bg-base-100 p-8">
					<LoadableNote />
				</div>
			</div>
		</div>
	);
}
