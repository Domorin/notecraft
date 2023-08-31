import { withSessionRoute } from "@/lib/session";
import { prisma } from "@/server/prisma";
import { decrypt } from "@/utils/crypto";
import { setEphemeralUserIdCookie } from "@/utils/user";
import { GetEnvVar } from "@notecraft/common";
import { NextApiRequest, NextApiResponse } from "next";
import { GCalAuthState, GoogleOAuth } from "../login/google";
import { people } from "@googleapis/people";

// https://developers.google.com/identity/protocols/oauth2/web-server#offline
// https://stackoverflow.com/questions/12909332/how-to-logout-of-an-application-where-i-used-oauth2-to-login-with-google
async function authHandler(req: NextApiRequest, res: NextApiResponse) {
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

	// TODO: decrypt locally
	const info = await GoogleOAuth().getTokenInfo(tokens.access_token!);

	if (!tokens.access_token || !tokens.expiry_date) {
		throw new Error("Invalid tokens from Google! " + tokens);
	}

	const peopleRequest = await people("v1").people.get({
		access_token: tokens.access_token,
		resourceName: "people/me",
		personFields: "photos",
	});

	const image = peopleRequest.data.photos?.find(
		(val) =>
			val.metadata?.primary && val.metadata.source?.type === "PROFILE"
	);

	const ephemeralUserId = decrypt(state.ephemeralUserId);

	// Tie user ID to Account
	const account = await prisma.account.upsert({
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
				// TODO: review this, don't want to lose their notes
				// If ephemeral user Id exists, associate existing account with it
				connect: ephemeralUserId
					? {
							id: ephemeralUserId,
					  }
					: undefined,
				// Else create new user
				create: !ephemeralUserId ? {} : undefined,
			},
		},
		update: {
			accessToken: tokens.access_token,
			refreshToken: tokens.refresh_token ?? undefined, // If refresh token does not exist, do nothing
			accessTokenExpires: new Date(tokens.expiry_date),
		},
		select: {
			userId: true,
		},
	});

	// Call this first, else session will be overwritten
	setEphemeralUserIdCookie(res, ephemeralUserId, 0);

	req.session.user = {
		id: account.userId,
		name: info.email!,
		image: image?.url ?? undefined,
		provider: "Google",
	};

	console.log("saving cookie!");
	await req.session.save();

	res.redirect(
		302,
		`${GetEnvVar("NEXT_PUBLIC_WEB_APP_PROTOCOL")}://${GetEnvVar(
			"NEXT_PUBLIC_WEB_APP_URL"
		)}`
	);
}

export default withSessionRoute(authHandler);
