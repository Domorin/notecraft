import { useIsFetching, useQueryClient } from "@tanstack/react-query";
import { RouterInput, RouterOutput } from "@/server/routers/_app";
import { getQueryKey } from "@trpc/react-query";
import { trpc } from "@/utils/trpc";

export function useUpdateMetadata(slug: string) {
	const context = trpc.useContext();

	return (newData: Partial<RouterOutput["note"]["listCreated"][number]>) => {
		context.note.metadata.setData({ slug }, (oldData) => {
			if (!oldData) {
				return oldData;
			}

			return { ...oldData, newData };
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
	};
}
