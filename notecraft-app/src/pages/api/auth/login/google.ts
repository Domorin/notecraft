import { encrypt } from "@/utils/crypto";
import { getUserIdFromCookie } from "@/utils/user";
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
	userId: string;
}

export default function authHandler(req: NextApiRequest, res: NextApiResponse) {
	console.log("got auth page!");

	const userId = getUserIdFromCookie(req);

	if (!userId) {
		throw new Error("No user ID found in cookie!");
	}

	// Encrypt user ID, this is not a big deal, but do not want it visible in the URL

	const encrypedUserId = encrypt(userId);

	const url = GoogleOAuth().generateAuthUrl({
		scope: "openid email profile",
		state: JSON.stringify({
			userId: encrypedUserId,
		} as GCalAuthState),
		// include_granted_scopes: true,
	});

	return res.redirect(url);
}
