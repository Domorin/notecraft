import { trpc } from "@/utils/trpc";
import { useUpdateMetadata } from "./use_update_metadata";
import { useRef } from "react";

export function useUpdateTitleMutation(slug: string) {
	const updateMetadata = useUpdateMetadata(slug);

	const context = trpc.useContext();

	return trpc.note.updateTitle.useMutation({
		onMutate: (data) => {
			const prevData = context.note.metadata.getData({
				slug: data.slug,
			});

			updateMetadata({ title: data.title });

			return prevData;
		},
		onSuccess: (data) => updateMetadata(data),
		onError: (error, variables, context) => {
			// Revert on error
			updateMetadata({
				title: context?.title,
			});
		},
	});
}
