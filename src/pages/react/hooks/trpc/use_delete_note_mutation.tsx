import { trpc } from "@/utils/trpc";
import { useDeleteNote } from "./use_delete_note";

export function useDeleteNoteMutation(slug: string) {
	const deleteNote = useDeleteNote();
	return trpc.note.delete.useMutation({
		onSuccess: (data) => deleteNote(slug),
	});
}
