import { RouterOutput } from "@/server/routers/_app";
import { trpc } from "@/utils/trpc";
import { useEffect, useState } from "react";
import { useLocalStorage } from "usehooks-ts";

const recentNotesKey = "recentNotes";

type RecentNotes = Record<string, Date>;

export function useNoteListRecent() {
	const [recents, setRecents] = useLocalStorage(
		recentNotesKey,
		{} as RecentNotes
	);

	const parsedRecents: Record<string, Date> = {};

	for (const [key, val] of Object.entries(recents)) {
		parsedRecents[key] = new Date(val);
	}

	return {
		recents: parsedRecents,
		add: (slug: string) =>
			setRecents((val) => {
				const newVal = { ...val };
				newVal[slug] = new Date();

				const keys = Object.keys(newVal);
				// Delete old recents
				for (const key of keys) {
					const date = new Date(newVal[key]);
					if (
						date.getTime() <
						Date.now() - 1000 * 60 * 60 * 24 * 30
					) {
						delete newVal[key];
					}
				}

				return newVal;
			}),
		remove: (slug: string) =>
			setRecents((val) => {
				const newVal = { ...val };
				delete newVal[slug];
				return newVal;
			}),
	};
}
