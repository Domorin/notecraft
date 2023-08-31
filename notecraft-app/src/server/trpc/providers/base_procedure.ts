import {
	getEphemeralUserIdFromCookie,
	setEphemeralUserIdCookie,
} from "@/utils/user";
import { prisma } from "../../prisma";
import { t } from "../trpc";
import { ClientUser } from "@/lib/session";

export const baseProcedure = t.procedure.use(
	t.middleware(async ({ ctx, next }) => {
		let user: ClientUser | undefined;
		// If session cookie exists, the user is logged in
		if (ctx.api.req.session?.user) {
			user = ctx.api.req.session.user;
		} else {
			// If session cookie does not exist, then we check to see if they have ephemeral cookie
			const ephemeralUserId = getEphemeralUserIdFromCookie(ctx.api.req);

			if (ephemeralUserId) {
				// If user has ephemeral cookie, then check the user entity
				const dbUser = await prisma.user.findUnique({
					where: {
						id: ephemeralUserId,
					},
					include: {
						Account: true,
					},
				});

				// If user exists but does not have an account, this is a legit ephemeral user Id
				if (dbUser && !dbUser?.Account) {
					user = { id: dbUser.id };
				}
				// If they DO have an existing account, this ephemeral user ID is invalid, we do not want to use it (they must be logged in to use it)
				// It will be overwritten below
			}

			if (!user) {
				// Create a new ephemeral user
				const dbUser = await prisma.user.create({
					data: {},
				});
				user = { id: dbUser.id };
			}

			// If user is not logged in, set ephemeral user ID cookie (on every request, so it updates the expiry)
			setEphemeralUserIdCookie(ctx.api.res, user.id);
		}

		return next({
			ctx: { ...ctx, user },
		});
	})
);
