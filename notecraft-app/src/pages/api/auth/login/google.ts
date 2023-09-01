import { withSessionRoute } from "@/lib/session";
import { encrypt } from "@/utils/crypto";
import { getEphemeralUserIdFromCookie } from "@/utils/user";
import { auth } from "@googleapis/oauth2";
import { GetEnvVar } from "@notecraft/common";
import { OAuth2Client } from "googleapis-common";
import { NextApiRequest, NextApiResponse } from "next";

let googleOAuthClient: OAuth2Client;
export function GoogleOAuth() {
	if (googleOAuthClient) {
		return googleOAuthClient;
	}

	googleOAuthClient = new auth.OAuth2(
		GetEnvVar("GOOGLE_ID"),
		GetEnvVar("GOOGLE_SECRET"),
		`${GetEnvVar("NEXT_PUBLIC_WEB_APP_PROTOCOL")}://${GetEnvVar(
			"NEXT_PUBLIC_WEB_APP_URL"
		)}/api/auth/callback/google`
	);

	return googleOAuthClient;
}

export interface GCalAuthState {
	ephemeralUserId: string;
}

function authHandler(req: NextApiRequest, res: NextApiResponse) {
	const ephemeralUserId = getEphemeralUserIdFromCookie(req);

	// Encrypt user ID, this is not a big deal, but do not want it visible in the URL

	const encrypedUserId = encrypt(ephemeralUserId ?? "");

	// TODO: add value of the anti-forgery unique session token

	const url = GoogleOAuth().generateAuthUrl({
		scope: "openid email profile",
		prompt: "select_account",
		state: JSON.stringify({
			ephemeralUserId: encrypedUserId,
		} as GCalAuthState),
	});

	res.redirect(url);
}

export default withSessionRoute(authHandler);
