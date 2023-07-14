import { initTRPC } from "@trpc/server";
import { CreateHTTPContextOptions } from "@trpc/server/adapters/standalone";
import { CreateWSSContextFnOptions } from "@trpc/server/adapters/ws";
import * as cookie from "cookie";
import { prisma } from "./prisma";
import { redis } from "./redis";

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

const t = initTRPC.context<typeof createContext>().create();
// Base router and procedure helpers
export const router = t.router;
export const procedure = t.procedure;

export const authedProcedure = t.procedure.use(
	t.middleware(async ({ ctx, next }) => {
		let userId = cookie.parse(ctx.api.req.headers.cookie || "")["id"];

		// TODO: do not make a user if they have cookies disabled
		if (!userId && "setHeader" in ctx.api.res) {
			const user = await prisma.user.create({
				data: {},
			});
			userId = user.id;

			ctx.api.res.setHeader(
				"Set-Cookie",
				cookie.serialize("id", userId, {
					httpOnly: true,
					sameSite: "strict",
					// secure: false,
					expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365),
					path: "/",
				})
			);
		}

		return next({
			ctx: { ...ctx, userId },
		});
	})
);
