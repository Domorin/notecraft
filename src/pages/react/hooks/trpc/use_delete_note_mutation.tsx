import { trpc } from "@/utils/trpc";
import { useDeleteNote } from "./use_delete_note";
import { useRouter } from "next/router";
import { usePageSlug } from "../use_page_id";
import { SidebarActiveListContext } from "../../components/sidebar/sidebar";
import { useContext } from "react";
import { useNoteListRecent } from "../use_recent_local_storage";
import { useQueryClient } from "@tanstack/react-query";
import { getQueryKey } from "@trpc/react-query";

export function useDeleteNoteMutation(slug: string) {
	const router = useRouter();
	const currentSlug = usePageSlug();
	const activeSidebar = useContext(SidebarActiveListContext);
	const trpcContext = trpc.useContext();
	const { recents } = useNoteListRecent();

	const queryClient = useQueryClient();

	const deleteNote = useDeleteNote();
	return trpc.note.delete.useMutation({
		onMutate: () => {
			if (slug === currentSlug) {
				let nextSlug: string | undefined;
				switch (activeSidebar) {
					case "Created": {
						const createdNotes =
							trpcContext.note.listCreated.getData();

						const currentIndex =
							createdNotes?.findIndex(
								(val) => val.slug === slug
							) ?? -1;

						nextSlug = (
							createdNotes?.[currentIndex - 1] ??
							createdNotes?.[currentIndex + 1]
						)?.slug;

						break;
					}
					case "Viewed": {
						const recentNotes = Object.keys(recents);

						const currentIndex = recentNotes.findIndex(
							(val) => val === slug
						);

						nextSlug =
							recentNotes?.[currentIndex - 1] ??
							recentNotes?.[currentIndex + 1];
						break;
					}
				}
				router.push(`/${nextSlug ?? ""}`);
			}
		},
		onSuccess: async (data) => {
			deleteNote(slug);
		},
	});
}
