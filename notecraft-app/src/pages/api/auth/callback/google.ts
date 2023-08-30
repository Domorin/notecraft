import { prisma } from "@/server/prisma";
import { NextApiRequest, NextApiResponse } from "next";
import { GCalAuthState, GoogleOAuth } from "../login/google";
import { GetEnvVar } from "@notecraft/common";
import { decrypt } from "@/utils/crypto";
import * as cookie from "cookie";

// https://developers.google.com/identity/protocols/oauth2/web-server#offline
// https://stackoverflow.com/questions/12909332/how-to-logout-of-an-application-where-i-used-oauth2-to-login-with-google
export default async function authHandler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	// We receive code from Google
	const code = req.query.code;
	const rawState = req.query.state;

	req.session.save();

	if (!rawState || Array.isArray(rawState)) {
		throw new Error(`Invalid Google state: ${rawState}`);
	}

	if (!code || Array.isArray(code)) {
		throw new Error(`Invalid Google code: ${code}`);
	}

	const state = JSON.parse(rawState) as GCalAuthState;
	const { tokens } = await GoogleOAuth().getToken(code);
	const info = await GoogleOAuth().getTokenInfo(tokens.access_token!);

	if (!tokens.access_token || !tokens.expiry_date) {
		throw new Error("Invalid tokens from Google! " + tokens);
	}

	// refresh token is good. if refresh token is no longer good, we need to send user back through auth
	// https://stackoverflow.com/questions/8942340/get-refresh-token-google-api

	// https://stackoverflow.com/questions/76677287/jwt-what-if-the-refresh-token-is-compromised

	// give user access token and refresh token.

	// login: we grant an access token to user, we store refresh token for that user on server side
	// if access token expires, we generate a new access token for the user

	// on logout, we revoke both access and refresh token. they can no longer be used
	// user must log in again to get new ones

	// if user steals access token

	// user logs in: give them session ID, this is what is stored in DB
	// use mapping from session ID to User ID to get their notes and shit
	// this can last forever
	// on logout, delete their session ID.
	// session ID is stored in a cookie.

	// the issue before is we stored their userId in the cookie, so if this gets leaked then we have no way of invalidating it
	// if we base everything on sessions, then a user can log out and just get a new one. they can be permanent depending on cookie life, but theres also support for them to be temporary

	// revoke refresh token on log out.

	// Treat google login as simply a normal log in
	// They login with google, now we manage everything
	// we do not care about refreshing or whatever, its already a valid login.
	// We can just do what I said above and we're good to go.

	// https://github.com/vvo/iron-session

	const existingAccount = await prisma.account.findUnique({
		where: {
			id: info.sub,
		},
	});

	if (existingAccount) {
		res.setHeader(
			"Set-Cookie",
			cookie.serialize("userId", existingAccount.userId, {
				httpOnly: true,
				sameSite: "strict",
				// secure: false,
				maxAge: 60 * 60 * 24 * 365,
				path: "/",
			})
		);
	} else {
	}

	const userId = decrypt(state.userId);

	// Tie user ID to Account
	await prisma.account.upsert({
		where: {
			id: info.sub,
		},
		create: {
			id: info.sub,
			type: "Google",
			accessToken: tokens.access_token,
			refreshToken: tokens.refresh_token,
			accessTokenExpires: new Date(tokens.expiry_date),
			User: {
				connect: {
					id: userId,
				},
			},
		},
		update: {
			accessToken: tokens.access_token,
			refreshToken: tokens.refresh_token ?? undefined, // If refresh token does not exist, do nothing
			accessTokenExpires: new Date(tokens.expiry_date),
		},
	});

	res.redirect(
		`${GetEnvVar("NEXT_PUBLIC_WEB_APP_PROTOCOL")}://${GetEnvVar(
			"NEXT_PUBLIC_WEB_APP_URL"
		)}`
	);
}
