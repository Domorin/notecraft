import { SSRContextOptions } from "@/server/trpc/trpc";
import * as cookie from "cookie";
import { IncomingMessage } from "http";

const ephemeralUserIdCookieName = "ephemeralUserId";

function isValidUserId(userId: string) {
	const match = userId.match(
		/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/
	);

	return userId === match?.[0];
}

export function setEphemeralUserIdCookie(
	res: SSRContextOptions["res"],
	userId: string,
	maxAge = 60 * 60 * 24 * 365
) {
	res.setHeader(
		"Set-Cookie",
		cookie.serialize(ephemeralUserIdCookieName, userId, {
			httpOnly: true,
			sameSite: "strict",
			secure: process.env.NODE_ENV === "production",
			maxAge: maxAge,
			path: "/",
		})
	);
}

export function getEphemeralUserIdFromCookie(
	req: IncomingMessage
): string | undefined {
	const userId = cookie.parse(req.headers.cookie || "")[
		ephemeralUserIdCookieName
	];

	return isValidUserId(userId ?? "") ? userId : undefined;
}
