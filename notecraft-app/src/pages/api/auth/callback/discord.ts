import { onLogin } from "@/lib/auth_utils";
import { withSessionRoute } from "@/lib/session";
import { decrypt } from "@/utils/crypto";
import { GetEnvVar } from "@notecraft/common";
import { NextApiRequest, NextApiResponse } from "next";
import { DiscordAuthState, getDiscordRedirectURI } from "../login/discord";

async function getToken(code: string) {
	const params = new URLSearchParams();
	params.append("client_id", GetEnvVar("DISCORD_ID"));
	params.append("client_secret", GetEnvVar("DISCORD_SECRET"));
	params.append("grant_type", "authorization_code");
	params.append("code", code);
	params.append("redirect_uri", getDiscordRedirectURI());

	const rawResult = await fetch("https://discord.com/api/oauth2/token", {
		method: "POST",
		body: params,
		headers: {
			"Content-type": "application/x-www-form-urlencoded",
		},
	});

	return (await rawResult.json()) as { access_token: string };
}

async function getUser(token: string): Promise<{
	id: string;
	username: string;
	global_name: string;
	avatar: string;
}> {
	return fetch("https://discord.com/api/users/@me", {
		method: "GET",
		headers: {
			Authorization: `Bearer ${token}`,
		},
	}).then((val) => val.json());
}

// https://developers.google.com/identity/protocols/oauth2/web-server#offline
// https://stackoverflow.com/questions/12909332/how-to-logout-of-an-application-where-i-used-oauth2-to-login-with-google
async function authHandler(req: NextApiRequest, res: NextApiResponse) {
	// General OAuth flow
	// 1. Authenticate with OAuth service
	// 2. Attach OAuth'd account to NoteCraft account
	// 3. Create session cookie for NoteCraft account
	// 4. Redirect to NoteCraft
	// Notes:
	// We do not need to store access tokens or refresh tokens, we do not use these for anything
	// We *could* store user avatar and name in DB, but it exists in cookie, so not necessary

	// We receive code from Google
	const code = req.query.code;
	const rawState = req.query.state;

	if (!rawState || Array.isArray(rawState)) {
		throw new Error(`Invalid Discord state: ${rawState}`);
	}

	if (!code || Array.isArray(code)) {
		throw new Error(`Invalid Discord code: ${code}`);
	}

	const { access_token } = await getToken(code);

	if (!access_token) {
		throw new Error("Invalid tokens from Discord!");
	}

	const state = JSON.parse(rawState) as DiscordAuthState;
	const userInfo = await getUser(access_token);

	if (!userInfo) {
		throw new Error("Invalid user from Discord!");
	}

	const ephemeralUserId = decrypt(state.ephemeralUserId);

	await onLogin(req, res, "Discord", ephemeralUserId, {
		accountId: userInfo.id,
		name: userInfo.global_name ?? userInfo.username,
		image: `https://cdn.discordapp.com/avatars/${userInfo.id}/${userInfo.avatar}.png`,
	});
}

export default withSessionRoute(authHandler);
