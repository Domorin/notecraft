import { router } from "../trpc";
import { baseProcedure } from "../providers/base_procedure";
import { ClientUser, IronSessionUser } from "@/lib/session";

function isLoggedInUser(user: ClientUser): user is IronSessionUser {
	return (user as IronSessionUser).provider !== undefined;
}

export const userRouter = router({
	info: baseProcedure.query(async ({ ctx: { user } }) => {
		if (!isLoggedInUser(user)) {
			return { isLoggedIn: false as const };
		}

		const { id: _id, ...userWithoutId } = user;

		return { isLoggedIn: true as const, user: userWithoutId };
	}),
	logout: baseProcedure.mutation(async ({ ctx: { user, api } }) => {
		if (!isLoggedInUser(user)) {
			return;
		}

		api.req.session.destroy();
	}),
});
