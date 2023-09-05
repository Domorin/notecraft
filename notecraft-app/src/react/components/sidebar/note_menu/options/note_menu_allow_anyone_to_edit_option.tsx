import { RouterOutput } from "@/server/trpc/routers/_app";
import { faLock, faLockOpen } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useUpdateEditPermissionsMutation } from "../../../../hooks/trpc/use_update_edit_permissions_mutation";
import classNames from "classnames";

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
				<label
					className={classNames("swap swap-flip grid w-6", {
						"swap-active": isChecked,
					})}
				>
					<div
						className={classNames(
							"swap-on grid-cols-1 grid-rows-1",
							{}
						)}
					>
						<FontAwesomeIcon icon={faLockOpen} />
					</div>
					<div
						className={classNames(
							"swap-off grid-cols-1 grid-rows-1",
							{}
						)}
					>
						<FontAwesomeIcon icon={faLock} />
					</div>
				</label>
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
