import { faX } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import classNames from "classnames";
import { ReactNode, useState } from "react";
import toast, { Toaster, resolveValue } from "react-hot-toast";
import { ModalContext } from "../hooks/use_modal";
import { Navbar } from "./navbar/navbar";
import Sidebar from "./sidebar/sidebar";

export default function MainPageContainer(props: { children: ReactNode }) {
	const [openedModal, setOpenModal] = useState(null as ReactNode | null);

	return (
		<ModalContext.Provider
			value={{
				openModal: (element) => setOpenModal(element),
				closeModal: () => {
					setOpenModal(null);
				},
			}}
		>
			{openedModal}
			<div className="main-bg from-base-100 via-base-300 to-base-200 flex h-screen items-center justify-center bg-gradient-to-br">
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
				<Navbar />
				<div className="rounded-box main-container m-12 flex h-5/6">
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
