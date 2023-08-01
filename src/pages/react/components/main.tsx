import { LoadableNote } from "./note";
import { Sidebar } from "./sidebar/sidebar";
import { ThemePicker } from "./theme_picker";

export default function MainPage() {
	return (
		<div className="flex h-screen items-center justify-center bg-base-300">
			<ThemePicker />
			<div className="rounded-box m-12 flex h-3/4 shadow-lg">
				<div className="rounded-l-box h-full w-[12rem] overflow-hidden border-y-2 border-l-2 border-neutral bg-base-200">
					<Sidebar />
				</div>
				<div className="rounded-r-box h-full flex-grow-0 border-y-2 border-r-2 border-neutral bg-base-100 lg:w-[64rem]">
					<LoadableNote />
				</div>
			</div>
		</div>
	);
}
