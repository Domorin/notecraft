import { Note, PrismaClient } from "@prisma/client";
import { DateTime } from "luxon";
import * as Y from "yjs";
import { encodeYDocContent } from "../notesmith-common/build/src/yjs/ydoc_utils";
import Logger from "../notesmith-common/build/src/logging";
import { getUniqueNoteSlug } from "../notesmith-app/src/server/words/words";

async function MockNotes(id: string) {
	if (process.env.NODE_ENV !== "development") {
		throw new Error("Can only mock notes in development mode");
	}

	const prisma = new PrismaClient({
		log: ["error", "warn"],
	});

	const notesToMake = 60;
	const hoursIncrement = 12;
	const now = DateTime.now();

	const promises: Promise<Note>[] = [];

	for (let i = 0; i < notesToMake; i++) {
		const ydoc = new Y.Doc();
		const children = ydoc.getArray("children");
		const child = new Y.Map();
		const childText = new Y.Text();

		ydoc.getText("type").insert(0, "p");
		childText.insert(0, "Hello World");
		child.set("text", childText);
		children.push([child]);

		const date = now.minus({ hours: i * hoursIncrement }).toJSDate();

		const slug = await getUniqueNoteSlug();

		promises.push(
			prisma.note.create({
				data: {
					content: Buffer.from(encodeYDocContent(ydoc)),
					slug: `MOCK_${slug}`,
					createdAt: date,
					updatedAt: date,
					creator: {
						connect: {
							id,
						},
					},
				},
			})
		);
	}

	await Promise.all(promises);

	Logger.info(`Successfully created ${promises.length} notes.`);
}

MockNotes(process.argv[2]);
