import { onLogin } from "@/lib/auth_utils";
import { withSessionRoute } from "@/lib/session";
import { decrypt } from "@/utils/crypto";
import { NextApiRequest, NextApiResponse } from "next";
import { GCalAuthState, GoogleOAuth } from "../login/google";

function decodeJwt(token: string) {
	const segments = token.split(".");

	if (segments.length !== 3) {
		throw new Error("Not enough or too many segments");
	}

	// All segment should be base64
	const headerSeg = segments[0];
	const payloadSeg = segments[1];
	const signatureSeg = segments[2];

	// base64 decode and parse JSON
	const header = JSON.parse(base64urlDecode(headerSeg));
	const payload = JSON.parse(base64urlDecode(payloadSeg));

	return {
		header: header as { alg: string; kid: string; typ: string },
		payload: payload as {
			sub: string;
			email: string;
			picture: string;
			name: string;
		},
		signature: signatureSeg,
	};
}

function base64urlDecode(str: string) {
	return Buffer.from(str, "base64").toString();
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
		throw new Error(`Invalid Google state: ${rawState}`);
	}

	if (!code || Array.isArray(code)) {
		throw new Error(`Invalid Google code: ${code}`);
	}

	const state = JSON.parse(rawState) as GCalAuthState;
	const { tokens } = await GoogleOAuth().getToken(code);

	if (!tokens.access_token || !tokens.expiry_date || !tokens.id_token) {
		throw new Error("Invalid tokens from Google! " + tokens);
	}

	const { payload: userInfo } = decodeJwt(tokens.id_token);

	const ephemeralUserId = decrypt(state.ephemeralUserId);

	await onLogin(req, res, "Google", ephemeralUserId, {
		accountId: userInfo.sub,
		name: userInfo.name,
		image: userInfo.picture,
	});
}

export default withSessionRoute(authHandler);
