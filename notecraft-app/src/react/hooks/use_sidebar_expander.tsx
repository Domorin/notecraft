import { createContext, useContext } from "react";

export const SidebarExpanderContext = createContext({
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	isOpen: true,
	setIsOpen: (_isOpen: boolean) => {},
});

export function useSidebarExpander() {
	return useContext(SidebarExpanderContext);
}
