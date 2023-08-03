import { trpc } from "@/utils/trpc";
import { useDeleteNote } from "./use_delete_note";
import { useRouter } from "next/router";
import { usePageSlug } from "../use_page_id";
import { SidebarActiveListContext } from "../../components/sidebar/sidebar";
import { useContext } from "react";
import { useNoteListRecent } from "../use_recent_local_storage";

export function useDeleteNoteMutation(slug: string) {
	const router = useRouter();
	const currentSlug = usePageSlug();
	const activeSidebar = useContext(SidebarActiveListContext);
	const trpcContext = trpc.useContext();
	const { recents } = useNoteListRecent();

	const deleteNote = useDeleteNote();
	return trpc.note.delete.useMutation({
		onSuccess: async (data) => {
			if (slug === currentSlug) {
				let nextSlug: string | undefined;
				switch (activeSidebar) {
					case "Created":
						nextSlug = trpcContext.note.listCreated
							.getData()
							?.filter((val) => val.slug !== slug)[0]?.slug;
						break;
					case "Viewed":
						nextSlug = Object.keys(recents)[0];
						break;
				}
				await router.push(`/${nextSlug ?? ""}`);
			}
			deleteNote(slug);
		},
	});
}
