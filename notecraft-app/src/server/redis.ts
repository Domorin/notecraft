import { Redis } from "@notecraft/common";
import { parseYDocContent } from "@notecraft/common/build/src/yjs";
import { yDocToProsemirrorJSON } from "y-prosemirror";
import { prisma } from "./prisma";
import { updateNoteMetadataForWeb } from "./trpc/routers//note";
import { CharacterLimit, calculateAttrLength } from "@/lib/note_limit_utils";

/**
 * Instantiates a single instance redisClient and save it on the global object.
 * @link https://www.prisma.io/docs/support/help-articles/nextjs-prisma-client-dev-practices
 */

type AppRedis = ReturnType<typeof Redis.initRedis<"App">>;

const globalForRedis = globalThis as unknown as {
	redis: AppRedis | undefined;
};

type YDocNode = {
	type: string;
	text?: string;
	content?: YDocNode[];
	attrs?: Record<string, string>;
	marks?: { type: string; attrs: Record<string, string> }[];
};

function getTextCount(node: YDocNode) {
	let textCount = 0;

	if (node.text) {
		textCount += node.text.length;
	}

	if (node.attrs) {
		textCount += calculateAttrLength({ attrs: node.attrs });
	}

	if (node.marks) {
		node.marks.forEach((mark) => {
			textCount += calculateAttrLength(mark);
		});
	}

	if (node.content) {
		node.content.forEach((child: YDocNode) => {
			textCount += getTextCount(child);
		});
	}

	return textCount;
}

export const redis: AppRedis =
	globalForRedis.redis ??
	Redis.initRedis({
		service: "App",
		rpcHandler: {
			GetNotePermissions: async (message) => {
				const note = await prisma.note.findUnique({
					where: {
						slug: message.slug,
					},
					select: {
						allowAnyoneToEdit: true,
						creatorId: true,
					},
				});

				if (!note) {
					return {
						_err: "GetNotePermissions error: Note not found",
					};
				}

				return note;
			},
			SaveDoc: async (message) => {
				const updatedAtDate = new Date();

				const buffer = Buffer.from(message.content);
				const doc = yDocToProsemirrorJSON(
					parseYDocContent(buffer),
					"default"
				) as YDocNode;

				const textCount = getTextCount(doc);

				if (textCount > CharacterLimit) {
					return {
						_err: "SaveDoc error: Note too long",
					};
				}

				await updateNoteMetadataForWeb(message.userId, {
					data: {
						content: buffer,
						updatedAt: updatedAtDate,
						viewedAt: updatedAtDate,
					},
					where: {
						slug: message.slug,
					},
					requireCreator: false,
				});

				return {
					success: true,
				};
			},
			GetDoc: async (message) => {
				const note = await prisma.note.findUnique({
					where: {
						slug: message.slug,
					},
					select: {
						content: true,
					},
				});

				if (!note) {
					return {
						_err: `GetDoc error: Note ${message.slug} not found`,
					};
				}

				return { content: Array.from(note.content) };
			},
		},
	});

if (process.env.NODE_ENV !== "production") {
	globalForRedis.redis = redis;
}
