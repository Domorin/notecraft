import { RouterOutput } from "@/server/routers/_app";
import { faLock, faLockOpen } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useUpdateEditPermissionsMutation } from "../../../../hooks/trpc/use_update_edit_permissions_mutation";

export function AllowAnyoneToEditOption(props: {
	metadata: RouterOutput["note"]["metadata"];
	disabled: boolean;
}) {
	const mutation = useUpdateEditPermissionsMutation(props.metadata.slug);

	const isChecked = props.metadata.allowAnyoneToEdit;

	return (
		<div
			className="flex items-center gap-4"
			onClick={() => {
				if (props.disabled) return;
				mutation.mutate({
					allowAnyoneToEdit: !isChecked,
					slug: props.metadata.slug,
				});
			}}
		>
			<div className="flex items-center gap-2">
				<div className="flex w-6 justify-center">
					<FontAwesomeIcon icon={isChecked ? faLockOpen : faLock} />
				</div>
				Allow anyone to edit
			</div>
			<input
				disabled={props.disabled}
				type="checkbox"
				className="toggle-primary toggle toggle-sm ml-auto"
				readOnly
				checked={isChecked}
			/>
		</div>
	);
}
