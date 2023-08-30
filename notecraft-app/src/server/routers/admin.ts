import { authedProcedure, router } from "../trpc";

export const adminRouter = router({
	getOrCreateWelcomeMessage: authedProcedure.mutation(
		async ({ ctx: { userId } }) => {}
	),
});
