import { inferRouterInputs, inferRouterOutputs } from "@trpc/server";
import { router } from "../trpc";
import { noteRouter } from "./note";
import { inferReactQueryProcedureOptions } from "@trpc/react-query";
import { adminRouter } from "./admin";
import { userRouter } from "./user";
export const appRouter = router({
	note: noteRouter,
	admin: adminRouter,
	user: userRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

export type RouterInput = inferRouterInputs<AppRouter>;
export type RouterOutput = inferRouterOutputs<AppRouter>;
export type ReactQueryOptions = inferReactQueryProcedureOptions<AppRouter>;
