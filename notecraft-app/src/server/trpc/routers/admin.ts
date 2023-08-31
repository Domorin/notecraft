import { router } from "../trpc";
import { baseProcedure } from "../providers/base_procedure";

export const adminRouter = router({
	getOrCreateWelcomeMessage: baseProcedure.mutation(
		async ({ ctx: { userId } }) => {}
	),
});
