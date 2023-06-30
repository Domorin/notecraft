import { useIsFetching, useQueryClient } from "@tanstack/react-query";
import { RouterInput, RouterOutput } from "@/server/routers/_app";
import { getQueryKey } from "@trpc/react-query";
import { trpc } from "@/utils/trpc";

export function useSetNoteMetadata(
	slug: string,
	) {
	const context = trpc.useContext();

	return (newData: Partial<RouterOutput["note"]["list"][number]>) => context.note.list.setData(undefined, (data) => {
		if (!data) {
			return data;
		}

		const index = data.findIndex((val) => val.slug === slug);
		if (index === -1) {
			return data;
		}

		const listCopy = [...data];
		listCopy[index] = { ...listCopy[index], ...newData}
		return listCopy;
	});
}
