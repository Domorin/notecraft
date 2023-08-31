import * as trpcNext from "@trpc/server/adapters/next";
import { withSessionRoute } from "@/lib/session";
import { appRouter } from "@/server/trpc/routers/_app";
import { createContext } from "@/server/trpc/trpc";
// export API handler
// @see https://trpc.io/docs/server/adapters
export default withSessionRoute(
	trpcNext.createNextApiHandler({
		router: appRouter,
		createContext,
	})
);
