import { useCreateNoteMutation } from "@/react/hooks/trpc/use_create_note_mutation";
import { RouterOutput } from "@/server/trpc/routers/_app";
import { faClone } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export function DuplicateNoteOption(props: {
	duplicateMutation: ReturnType<typeof useCreateNoteMutation>;
	metadata: RouterOutput["note"]["metadata"];
	disabled: boolean;
}) {
	return (
		<div
			className="flex items-center gap-2"
			onClick={() => {
				props.duplicateMutation.mutate({
					duplicatedSlug: props.metadata.slug,
				});
			}}
		>
			<div className="flex w-6 justify-center">
				<FontAwesomeIcon icon={faClone} />
			</div>
			<div>Duplicate</div>
		</div>
	);
}
