import * as cookie from "cookie";
import { IncomingMessage } from "http";

const ephemeralCookieIdName = "ephemeralId";

export function getEphemeralUserId(req: IncomingMessage) {
	return cookie.parse(req.headers.cookie || "")[ephemeralCookieIdName];
}
