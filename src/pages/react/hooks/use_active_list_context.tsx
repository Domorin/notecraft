import { useContext } from "react";
import { SidebarActiveListContext } from "../components/sidebar/sidebar";

export function useActiveListContext() {
	return useContext(SidebarActiveListContext);
}
