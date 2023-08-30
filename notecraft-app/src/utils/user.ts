import * as cookie from "cookie";
import { IncomingMessage } from "http";

const userIdCookieName = "userId";

export function getUserIdFromCookie(req: IncomingMessage) {
	return cookie.parse(req.headers.cookie || "")[userIdCookieName];
}
