import { faX } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import classNames from "classnames";
import toast, { Toaster, resolveValue } from "react-hot-toast";
import { NotFoundPage } from "./not_found_page";
import { Sidebar } from "./sidebar/sidebar";
import { ThemePicker } from "./theme_picker";
import Note from "./note/note";

export default function MainPage(props: { is_not_found?: boolean }) {
	return (
		<div className="flex h-screen items-center justify-center bg-base-300">
			<ReactQueryDevtools />
			<Toaster position="bottom-center">
				{(t) => (
					<div
						className={classNames(
							"rounded-box flex gap-2 p-2 pl-4 text-base",
							{
								"bg-success text-success-content":
									t.type === "success",
								"bg-error text-error-content":
									t.type === "error",
							}
						)}
					>
						{resolveValue(t.message, t)}
						<button
							className="btn-ghost rounded-btn p-1 text-xs"
							onClick={() => toast.remove(t.id)}
						>
							<FontAwesomeIcon icon={faX} />
						</button>
					</div>
				)}
			</Toaster>
			<ThemePicker />
			<div className="rounded-box m-12 flex h-3/4 shadow-lg">
				<div className="rounded-l-box h-full w-[12rem] overflow-hidden border-y-2 border-l-2 border-neutral bg-base-200">
					<Sidebar />
				</div>
				<div className="rounded-r-box h-full flex-grow-0 border-y-2 border-r-2 border-neutral bg-base-100 lg:w-[64rem]">
					{!props.is_not_found ? <Note /> : <NotFoundPage />}
				</div>
			</div>
		</div>
	);
}
