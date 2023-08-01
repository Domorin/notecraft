import { trpc } from "@/utils/trpc";
import { useUpdateMetadata } from "./use_update_metadata";

export function useUpdateEditPermissionsMutation(slug: string) {
	const updateMetadata = useUpdateMetadata(slug);

	const context = trpc.useContext();
	return trpc.note.updateEditPermissions.useMutation({
		onMutate: (data) => {
			const prevData = context.note.metadata.getData({
				slug: data.slug,
			});
			updateMetadata({ allowAnyoneToEdit: data.allowAnyoneToEdit });

			return prevData;
		},
		onSuccess: (data) => updateMetadata(data),
		onError: (error, variables, context) => {
			// Reverse setData if there was an error
			updateMetadata({
				allowAnyoneToEdit: context?.allowAnyoneToEdit,
			});
		},
	});
}
