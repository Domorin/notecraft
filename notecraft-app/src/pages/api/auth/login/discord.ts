import { withSessionRoute } from "@/lib/session";
import { encrypt } from "@/utils/crypto";
import { getEphemeralUserIdFromCookie } from "@/utils/user";
import { GetEnvVar } from "@notecraft/common";
import { NextApiRequest, NextApiResponse } from "next";

export interface DiscordAuthState {
	ephemeralUserId: string;
}

export function getDiscordRedirectURI() {
	return `${GetEnvVar("NEXT_PUBLIC_WEB_APP_PROTOCOL")}://${GetEnvVar(
		"NEXT_PUBLIC_WEB_APP_URL"
	)}/api/auth/callback/discord`;
}

function generateDiscordUrl(ephemeralUserId: string) {
	// Encrypt user ID, this is not a big deal, but do not want it visible in the URL
	const state: DiscordAuthState = {
		ephemeralUserId: encrypt(ephemeralUserId),
	};

	const encodedState = encodeURIComponent(JSON.stringify(state));

	const redirectUri = encodeURIComponent(getDiscordRedirectURI());

	return `https://discord.com/api/oauth2/authorize?client_id=${GetEnvVar(
		"DISCORD_ID"
	)}&redirect_uri=${redirectUri}&response_type=code&scope=identify&state=${encodedState}`;
}

function authHandler(req: NextApiRequest, res: NextApiResponse) {
	// TODO: add value of the anti-forgery unique session token
	const url = generateDiscordUrl(getEphemeralUserIdFromCookie(req) ?? "");

	res.redirect(url);
}

export default withSessionRoute(authHandler);
