import { ProviderType } from "@prisma/client";
import { IronSessionData, IronSessionOptions } from "iron-session";
import { withIronSessionApiRoute, withIronSessionSsr } from "iron-session/next";
import {
	GetServerSidePropsContext,
	GetServerSidePropsResult,
	NextApiHandler,
} from "next";

declare module "iron-session" {
	interface IronSessionData {
		user: {
			id: string;
			accountId: string;
			name: string;
			image?: string;
			provider: ProviderType;
		};
	}
}

export type IronSessionUser = IronSessionData["user"];

export type ClientUser = IronSessionUser | { id: string };

// Can not use GetEnvVar because we are importing this in _app.tsx, and it does not like redis in common
export const ironOptions: IronSessionOptions = {
	cookieName: process.env.SESSION_COOKIE_NAME!,
	password: process.env.SESSION_SECRET!,
	// secure: true should be used in production (HTTPS) but can't be used in development (HTTP)
	cookieOptions: {
		secure: process.env.NODE_ENV === "production",
		sameSite: "lax",
	},
};

export function withSessionRoute(handler: NextApiHandler) {
	return withIronSessionApiRoute(handler, ironOptions);
}

export function withSessionSsr<
	P extends { [key: string]: unknown } = { [key: string]: unknown }
>(
	handler: (
		context: GetServerSidePropsContext
	) => GetServerSidePropsResult<P> | Promise<GetServerSidePropsResult<P>>
) {
	return withIronSessionSsr(handler, ironOptions);
}
