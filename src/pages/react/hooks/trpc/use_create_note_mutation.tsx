import { trpc } from "@/utils/trpc";
import router from "next/router";

export function useCreateNoteMutation(onSuccess?: () => void) {
	const context = trpc.useContext();

	return trpc.note.create.useMutation({
		onSuccess: (data) => {
			context.note.listCreated.setData(undefined, (slugs) => {
				if (!slugs) {
					return slugs;
				}

				return [
					{
						slug: data.slug,
						updatedAt: data.updatedAt,
						createdAt: data.createdAt,
						viewedAt: data.viewedAt,
						views: data.views,
						title: data.title,
						allowAnyoneToEdit: data.allowAnyoneToEdit,
						isCreatedByYou: data.isCreatedByYou,
					},
					...slugs,
				];
			});
			router.push(`/${data.slug}`);

			onSuccess?.();
		},
	});
}
