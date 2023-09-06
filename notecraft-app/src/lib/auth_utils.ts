import { NextApiRequest, NextApiResponse } from "next";
import { IronSessionUser } from "./session";
import { prisma } from "@/server/prisma";
import { setEphemeralUserIdCookie } from "@/utils/user";
import { ProviderType } from "@prisma/client";
import { GetEnvVar } from "@notecraft/common";

export async function onLogin(
	req: NextApiRequest,
	res: NextApiResponse,
	provider: ProviderType,
	ephemeralUserId: string | undefined,
	userInfo: Omit<IronSessionUser, "accountId" | "provider">
) {
	// Tie user ID to Account
	const account = await prisma.account.upsert({
		where: {
			id_provider: {
				id: userInfo.id,
				provider,
			},
		},
		create: {
			id: userInfo.id,
			provider,
			User: {
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
		update: {},
		select: {
			userId: true,
			id: true,
		},
	});

	if (ephemeralUserId && account.userId !== ephemeralUserId) {
		// If ephemeral user ID does not match the just logged in account, tranfer the ephemeral IDs notes to the created accounts
		// We make sure to check that the ephemeral ID does not have an account associated with it, otherwise the notes will be 'stolen' from that account
		await prisma.note.updateMany({
			data: {
				creatorId: account.userId,
			},
			where: {
				creator: {
					id: ephemeralUserId,
					Account: null,
				},
			},
		});
	}

	// Delete ephemeral cookie -- Call this first, else session will be overwritten
	setEphemeralUserIdCookie(res, ephemeralUserId ?? "", 0);

	// Signed iron session cookie, should be secure
	// Was worried about expiry being edited client-side, but iron-session stores its own encrypted expiry that can not be tampered with
	req.session.user = { ...userInfo, accountId: account.id, provider };

	await req.session.save();

	res.redirect(
		302,
		`${GetEnvVar("NEXT_PUBLIC_WEB_APP_PROTOCOL")}://${GetEnvVar(
			"NEXT_PUBLIC_WEB_APP_URL"
		)}`
	);
}
