import { trpc } from "@/utils/trpc";
import { useUpdateMetadata } from "./use_update_metadata";

export function useUpdateTitleMutation(slug: string) {
	const updateMetadata = useUpdateMetadata(slug);

	return trpc.note.updateTitle.useMutation({
		onMutate: (data) => updateMetadata({ title: data.title }),
		onSuccess: (data) => updateMetadata(data),
	});
}
