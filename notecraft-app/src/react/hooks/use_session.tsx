import { IronSessionUser } from "@/lib/session";
import { createContext, useContext } from "react";

export const SessionContext = createContext(
	undefined as IronSessionUser | undefined
);

export function useSession() {
	return useContext(SessionContext);
}
