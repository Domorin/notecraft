import { faX } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import classNames from "classnames";
import { ReactNode, useState } from "react";
import toast, { Toaster, resolveValue } from "react-hot-toast";
import { ModalContext } from "../hooks/use_modal";
import Sidebar from "./sidebar/sidebar";
import ThemePicker from "./theme_picker";

export default function MainPageContainer(props: { children: ReactNode }) {
	const [openModal, setOpenModal] = useState(null as ReactNode | null);

	return (
		<ModalContext.Provider
			value={{
				openModal: (element) => setOpenModal(element),
				closeModal: () => {
					setOpenModal(null);
				},
			}}
		>
			{openModal}
			<div className="from-base-200 via-base-300 to-base-100 flex h-screen items-center justify-center bg-gradient-to-br">
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
				<div className="rounded-box shadow-primary m-12 flex h-5/6 drop-shadow-lg">
					<div className="rounded-l-box border-neutral bg-base-200 h-full w-[12rem] overflow-hidden border-y-2 border-l-2">
						<Sidebar />
					</div>
					<div className="rounded-r-box border-neutral bg-base-100 h-full flex-grow-0 border-y-2 border-r-2 lg:w-[64rem]">
						{props.children}
					</div>
				</div>
			</div>
		</ModalContext.Provider>
	);
}
