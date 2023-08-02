import { faX } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import toast, { Toaster, resolveValue } from "react-hot-toast";
import { NotFoundPage } from "./not_found_page";
import { LoadableNote } from "./note";
import { Sidebar } from "./sidebar/sidebar";
import { ThemePicker } from "./theme_picker";
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/router";
import { TRPCClientError } from "@trpc/client";

export default function MainPage(props: { is_not_found?: boolean }) {
	return (
		<div className="flex h-screen items-center justify-center bg-base-300">
			<Toaster position="bottom-center">
				{(t) => (
					<div className="rounded-box flex gap-2 bg-error p-2 pl-4 text-base text-error-content">
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
					{!props.is_not_found ? <LoadableNote /> : <NotFoundPage />}
				</div>
			</div>
		</div>
	);
}
