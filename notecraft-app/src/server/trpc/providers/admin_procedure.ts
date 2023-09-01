import { IronSessionUser } from "@/lib/session";
import { GetEnvVar } from "@notecraft/common";
import { TRPCError } from "@trpc/server";
import { t } from "../trpc";

function isAdmin(user: IronSessionUser) {
	const adminAccounts = GetEnvVar("ADMIN_ACCOUNTS")
		.split(",")
		.map((val) => {
			const strings = val.split(":");
			return {
				provider: strings[0],
				id: strings[1],
			};
		});

	return adminAccounts.some((account) => {
		return (
			account.provider === user.provider && account.id === user.accountId
		);
	});
}

export const adminProcedure = t.procedure.use(
	t.middleware(async ({ ctx, next }) => {
		// If session cookie exists, the user is logged in

		const user = ctx.api.req.session?.user;
		if (!user) {
			throw new TRPCError({
				code: "UNAUTHORIZED",
			});
		}

		if (!isAdmin(user)) {
			throw new TRPCError({
				code: "UNAUTHORIZED",
			});
		}

		return next({
			ctx: { ...ctx, user },
		});
	})
);
