import { useCallback } from "react";
import { useLocalStorage } from "usehooks-ts";

export const recentNotesKey = "recentNotes";

type RecentNotes = Record<string, Date>;

export function removeFromLocalStorage(slug: string) {
	const recents = localStorage.getItem(recentNotesKey);

	if (!recents) {
		return;
	}

	const parsedRecents = JSON.parse(recents) as RecentNotes;

	delete parsedRecents[slug];

	localStorage.setItem(recentNotesKey, JSON.stringify(parsedRecents));
}

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
		add: useCallback(
			(slug: string) =>
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
			[setRecents]
		),
		remove: useCallback(
			(slug: string) =>
				setRecents((val) => {
					const newVal = { ...val };
					delete newVal[slug];
					return newVal;
				}),
			[setRecents]
		),
	};
}
