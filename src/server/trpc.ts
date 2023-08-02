import { initTRPC } from "@trpc/server";
import { CreateHTTPContextOptions } from "@trpc/server/adapters/standalone";
import { CreateWSSContextFnOptions } from "@trpc/server/adapters/ws";
import * as cookie from "cookie";
import { prisma } from "./prisma";

export const createContext = async (
	opts: CreateHTTPContextOptions | CreateWSSContextFnOptions
) => {
	// https://stackoverflow.com/a/73200295

	return {
		api: {
			req: opts.req,
			res: opts.res,
		},
	};
};

function isValidUserId(userId: string) {
	const match = userId.match(
		/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/
	);

	return userId === match?.[0];
}

const t = initTRPC.context<typeof createContext>().create();
// Base router and procedure helpers
export const router = t.router;
export const procedure = t.procedure;

export const authedProcedure = t.procedure.use(
	t.middleware(async ({ ctx, next }) => {
		let userId = cookie.parse(ctx.api.req.headers.cookie || "")["id"];

		const shouldCreateNewUser = !userId || !isValidUserId(userId);

		if (shouldCreateNewUser && "setHeader" in ctx.api.res) {
			// TODO: do not make a user if they have cookies disabled
			const user = await prisma.user.create({
				data: {},
			});
			userId = user.id;
		}

		if ("setHeader" in ctx.api.res) {
			ctx.api.res.setHeader(
				"Set-Cookie",
				cookie.serialize("id", userId, {
					httpOnly: true,
					sameSite: "strict",
					// secure: false,
					maxAge: 60 * 60 * 24 * 365,
					path: "/",
				})
			);
		}

		return next({
			ctx: { ...ctx, userId },
		});
	})
);
