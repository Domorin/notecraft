import { LoadableNote } from "./note";
import { Sidebar } from "./sidebar";
import { ThemePicker } from "./theme_picker";
import "../../../../node_modules/pattern.css/dist/pattern.min.css"

export default function MainPage() {
	return (
		<div className="flex h-screen items-center justify-center bg-base-300">
			<ThemePicker />
			<div className="rounded-box flex h-3/4 w-3/4 shadow-lg border-2 border-neutral overflow-hidden">
				<div className="w-1/6 bg-base-200 rounded-l-box">
					<Sidebar />
				</div>
				<div className="flex-grow bg-base-100 p-8 rounded-r-box">
					<LoadableNote />
				</div>
			</div>
		</div>
	);
}
