import { RouterOutput } from "@/server/trpc/routers/_app";
import { trpc } from "@/utils/trpc";
import { useCallback } from "react";

export function useUpdateMetadata(slug: string) {
	const context = trpc.useContext();

	return useCallback(
		(newData: Partial<RouterOutput["note"]["listCreated"][number]>) => {
			context.note.metadata.setData({ slug }, (oldData) => {
				if (!oldData) {
					return oldData;
				}

				return { ...oldData, ...newData };
			});
			context.note.listCreated.setData(undefined, (data) => {
				if (!data) {
					return data;
				}

				const index = data.findIndex((val) => val.slug === slug);
				if (index === -1) {
					return data;
				}

				const listCopy = [...data];
				const oldData = listCopy.splice(index, 1)[0];

				return [{ ...oldData, ...newData }, ...listCopy];
			});
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[slug]
	);
}
