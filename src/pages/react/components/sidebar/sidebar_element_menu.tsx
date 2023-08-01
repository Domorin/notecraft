import { RouterOutput } from "@/server/routers/_app";
import {
	faEdit,
	faEllipsis,
	faLink,
	faLock,
	faLockOpen,
	faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import classNames from "classnames";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useCopyToClipboard, useOnClickOutside } from "usehooks-ts";
import { DateTime } from "luxon";
import { useUpdateEditPermissionsMutation } from "../../hooks/trpc/use_update_edit_permissions_mutation";

type MenuProps = {
	openTitleInput: () => void;
	metadata: RouterOutput["note"]["metadata"];
};

export function SidebarElementMenu(props: MenuProps) {
	const [isOpen, setIsOpen] = useState(false);

	const labelRef = useRef(null as HTMLLabelElement | null);

	return (
		<div
			className={classNames("dropdown ml-auto", {
				"dropdown-open": isOpen,
			})}
		>
			<label
				ref={labelRef}
				className="btn-ghost btn-xs btn invisible cursor-pointer p-1 group-hover:visible"
				onClick={(e) => {
					e.preventDefault();
					setIsOpen(true);
				}}
			>
				<FontAwesomeIcon icon={faEllipsis} />
			</label>
			{isOpen &&
				labelRef.current &&
				createPortal(
					<MenuPopup
						{...props}
						parentRef={labelRef.current}
						close={() => setIsOpen(false)}
					/>,
					document.body
				)}
		</div>
	);
}

function MenuPopup(
	props: MenuProps & { close: () => void; parentRef: HTMLLabelElement }
) {
	const ref = useRef(null as HTMLUListElement | null);
	const [_, setCopied] = useCopyToClipboard();

	useOnClickOutside(ref, props.close);

	useEffect(() => {
		const setPosition = () => {
			if (ref.current) {
				const { left, top } = props.parentRef.getBoundingClientRect();

				ref.current.style.left = `${left}px`;
				ref.current.style.top = `${top}px`;
			}
		};
		setPosition();

		window.addEventListener("resize", setPosition);

		return () => window.removeEventListener("resize", setPosition);
	}, [props.parentRef, ref]);

	const disabled =
		!props.metadata.isCreatedByYou && !props.metadata.allowAnyoneToEdit;

	return (
		<ul
			className="dropdown-content menu rounded-box absolute z-[1] ml-2 mt-2 w-fit min-w-[14rem] bg-base-300 py-2 text-base-content shadow"
			ref={ref}
			onClick={(e) => e.preventDefault()}
		>
			<li
				className={classNames({
					"disabled [&>*]:hover:!cursor-not-allowed [&>*]:hover:!bg-inherit [&>*]:hover:!text-inherit":
						disabled,
				})}
			>
				<div className="flex items-center gap-2">
					<div className="flex w-6 justify-center">
						<FontAwesomeIcon icon={faTrash} />
					</div>
					Delete
				</div>
			</li>
			<li
				className={classNames({
					"disabled [&>*]:hover:!cursor-not-allowed [&>*]:hover:!bg-inherit [&>*]:hover:!text-inherit":
						disabled,
				})}
			>
				<div
					className="flex items-center gap-2"
					onClick={!disabled ? props.openTitleInput : undefined}
				>
					<div className="flex w-6 justify-center">
						<FontAwesomeIcon icon={faEdit} />
					</div>
					Rename
				</div>
			</li>
			<li>
				<div
					className="flex items-center gap-2"
					onClick={(e) => {
						e.preventDefault();
						setCopied(
							window.location.origin + "/" + props.metadata.slug
						);
						props.close();
					}}
				>
					<div className="flex w-6 justify-center">
						<FontAwesomeIcon icon={faLink} />
					</div>
					Copy Link
				</div>
			</li>
			<li
				className={classNames({
					"disabled [&>*]:hover:!cursor-not-allowed [&>*]:hover:!bg-inherit [&>*]:hover:!text-inherit":
						disabled,
				})}
			>
				<AllowAnyoneToEditOption
					metadata={props.metadata}
					disabled={disabled}
				/>
			</li>
			<div className="divider my-0"></div>
			<li className="px-2 text-xs opacity-40">
				{`Edited ${getTimeText(props.metadata.updatedAt)}`}
				<br />
				{`Viewed ${getTimeText(props.metadata.viewedAt)}`}
			</li>
		</ul>
	);
}

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

export function getRelativeTimeText(iso: string) {
	const date = DateTime.fromISO(iso);

	const updatedAtDiffNow = Math.abs(date.diffNow().toMillis());
	return updatedAtDiffNow < 1000 * 60
		? "less than a minute ago"
		: date.toRelative({
				round: true,
		  });
}

export function getTimeText(iso: string) {
	const date = DateTime.fromISO(iso);

	return date.toLocaleString({
		dateStyle: "medium",
		timeStyle: "short",
	});
}
