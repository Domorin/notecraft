import { RouterOutput } from "@/server/trpc/routers/_app";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Spinner } from "../../../spinner";
import { useDeleteNoteMutation } from "@/react/hooks/trpc/use_delete_note_mutation";

export function DeleteNoteOption(props: {
	deleteMutation: ReturnType<typeof useDeleteNoteMutation>;
	metadata: RouterOutput["note"]["metadata"];
	disabled: boolean;
}) {
	return (
		<div
			className="flex items-center gap-2"
			onClick={() =>
				props.deleteMutation.mutate({
					slug: props.metadata.slug,
				})
			}
		>
			<div className="flex w-6 justify-center">
				<FontAwesomeIcon icon={faTrash} />
			</div>
			<div>Delete</div>
			{props.deleteMutation.isLoading && (
				<div className="ml-auto">
					<Spinner size="xs" />
				</div>
			)}
		</div>
	);
}
