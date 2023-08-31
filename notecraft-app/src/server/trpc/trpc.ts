import { initTRPC } from "@trpc/server";
import { CreateNextContextOptions } from "@trpc/server/adapters/next";
import superjson from "superjson";
import { IncomingMessage } from "http";
import { NextApiRequestCookies } from "next/dist/server/api-utils";
import { ServerResponse } from "http";

export type SSRContextOptions = {
	req: IncomingMessage & { cookies: NextApiRequestCookies };
	res: ServerResponse<IncomingMessage>; // Previous thought: `res?: ServerResponse;`
};

export const createContext = async (
	opts: CreateNextContextOptions | SSRContextOptions
) => {
	// https://stackoverflow.com/a/73200295

	return {
		api: {
			req: opts.req,
			res: opts.res,
		},
	};
};

export const t = initTRPC.context<typeof createContext>().create({
	transformer: superjson,
});
// Base router and procedure helpers
export const router = t.router;
export const procedure = t.procedure;
