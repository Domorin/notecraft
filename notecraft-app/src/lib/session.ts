import { GetEnvVar } from "@notecraft/common";
import { TokenType } from "@prisma/client";
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
			provider: TokenType;
		};
	}
}

export type IronSessionUser = IronSessionData["user"];

export type ClientUser = IronSessionUser | { id: string };

export const ironOptions: IronSessionOptions = {
	cookieName: GetEnvVar("SESSION_COOKIE_NAME"),
	password: GetEnvVar("SESSION_SECRET"),
	// secure: true should be used in production (HTTPS) but can't be used in development (HTTP)
	cookieOptions: {
		secure: process.env.NODE_ENV === "production",
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
