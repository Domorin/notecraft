import { useNoteListRecent } from "@/react/hooks/use_recents";
import { RouterOutput } from "@/server/routers/_app";
import { faX } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export function RemoveFromRecentsOption(props: {
	metadata: RouterOutput["note"]["metadata"];
	disabled: boolean;
}) {
	const { remove } = useNoteListRecent();

	return (
		<div
			className="flex items-center gap-2"
			onClick={() => {
				remove(props.metadata.slug);
			}}
		>
			<div className="flex w-6 justify-center">
				<FontAwesomeIcon icon={faX} />
			</div>
			<div>Remove from Recents</div>
		</div>
	);
}
