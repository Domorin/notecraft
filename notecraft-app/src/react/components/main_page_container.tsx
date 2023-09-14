import { RootPageProps } from "@/pages";
import { faX } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import classNames from "classnames";
import Cookies from "js-cookie";
import { ReactNode, useEffect, useState } from "react";
import toast, { Toaster, resolveValue } from "react-hot-toast";
import { ModalContext } from "../hooks/use_modal";
import { SidebarExpanderContext } from "../hooks/use_sidebar_expander";
import { Navbar } from "./navbar/navbar";
import Sidebar from "./sidebar/sidebar";
import { SidebarExpander } from "./sidebar/sidebar_expander";

export default function MainPageContainer(
	props: RootPageProps & { children: ReactNode }
) {
	const [openedModal, setOpenModal] = useState(null as ReactNode | null);

	const [sidebarOpen, setSidebarOpen] = useState(props.sidebarOpened);

	useEffect(() => {
		Cookies.set("sidebarOpen", sidebarOpen ? "true" : "false", {
			expires: 365,
			sameSite: "lax",
		});
	}, [sidebarOpen]);

	return (
		<SidebarExpanderContext.Provider
			value={{
				isOpen: sidebarOpen,
				setIsOpen: setSidebarOpen,
			}}
		>
			<ModalContext.Provider
				value={{
					openModal: (element) => setOpenModal(element),
					closeModal: () => {
						setOpenModal(null);
					},
				}}
			>
				{openedModal}
				<div className="main-bg from-base-100 via-base-300 to-base-200 flex h-screen min-h-0 max-w-[100vw] flex-col items-center overflow-x-hidden bg-gradient-to-br">
					<ReactQueryDevtools />
					<Toaster position="bottom-center">
						{(t) => (
							<div
								className={classNames(
									"rounded-box my-toast flex gap-2 p-2 pl-4 text-base",
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
					<div className="rounded-box main-container relative flex min-h-0 w-[95vw] min-w-0 flex-grow lg:w-[72rem] lg:max-w-[95vw]">
						<div className="absolute bottom-0 top-0 sm:static">
							<div className="flex h-full">
								<div
									className={classNames(
										"rounded-l-box border-neutral bg-base-200 z-[50] flex h-full border-y-2 border-l-2 transition-all duration-200",
										{
											"border-neutral block w-48 min-w-[12rem] max-w-[12rem] opacity-100":
												sidebarOpen,
											"pointer-events-none invisible min-w-0 max-w-0 border-none opacity-0":
												!sidebarOpen,
										}
									)}
								>
									<Sidebar />
								</div>
								<div className="relative right-0 z-50">
									<div className="absolute">
										<SidebarExpander />
									</div>
								</div>
							</div>
						</div>
						<div
							className={classNames(
								"bg-base-100 border-neutral h-full w-full min-w-0 border-2 transition-all duration-200",
								{
									"rounded-box": !sidebarOpen,
									"rounded-box sm:rounded-r-box sm:rounded-l-none sm:border-y-2 sm:border-l-0 sm:border-r-2":
										sidebarOpen,
								}
							)}
						>
							{props.children}
						</div>
					</div>
					<div className="min-h-12 h-12 w-full"></div>
				</div>
			</ModalContext.Provider>
		</SidebarExpanderContext.Provider>
	);
}
