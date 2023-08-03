import { RouterOutput } from "@/server/routers/_app";
import { faEdit, faEllipsis, faLink } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import classNames from "classnames";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useCopyToClipboard, useOnClickOutside } from "usehooks-ts";
import { DateTime } from "luxon";
import { useDeleteNoteMutation } from "../../../hooks/trpc/use_delete_note_mutation";
import { AllowAnyoneToEditOption } from "./options/note_menu_allow_anyone_to_edit_option";
import { DeleteNoteOption } from "./options/note_menu_delete_option";
import { DuplicateNoteOption } from "./options/note_menu_duplicate_option";
import { RemoveFromRecentsOption } from "./options/note_menu_remove_from_recents_option";
import { useActiveListContext } from "@/pages/react/hooks/use_active_list_context";
import { useCreateNoteMutation } from "@/pages/react/hooks/trpc/use_create_note_mutation";

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

	const deleteMutation = useDeleteNoteMutation(props.metadata.slug);
	const duplicateMutation = useCreateNoteMutation(props.close);
	const activeListContext = useActiveListContext();

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

	const isCreatedByYou = props.metadata.isCreatedByYou;

	const disabled =
		deleteMutation.isLoading ||
		duplicateMutation.isLoading ||
		(!props.metadata.isCreatedByYou && !props.metadata.allowAnyoneToEdit);

	return (
		<ul
			className="rouded-box dropdown-content menu menu-sm absolute z-[1] ml-2 mt-2 w-fit min-w-[14rem] bg-base-300 py-2 text-sm text-base-content shadow"
			ref={ref}
			onClick={(e) => e.preventDefault()}
		>
			{isCreatedByYou && (
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
			)}
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
			{isCreatedByYou && (
				<li
					className={classNames({
						"disabled [&>*]:hover:!cursor-not-allowed [&>*]:hover:!bg-inherit [&>*]:hover:!text-inherit":
							disabled,
					})}
				>
					<DeleteNoteOption
						deleteMutation={deleteMutation}
						disabled={disabled}
						metadata={props.metadata}
					/>
				</li>
			)}
			<div className="divider my-0"></div>
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
			<li>
				<DuplicateNoteOption
					duplicateMutation={duplicateMutation}
					disabled={disabled}
					metadata={props.metadata}
				/>
			</li>
			{activeListContext === "Recents" && (
				<li>
					<RemoveFromRecentsOption
						disabled={disabled}
						metadata={props.metadata}
					/>
				</li>
			)}
			<div className="divider my-0"></div>
			<li className="px-2 text-xs opacity-40">
				{`Edited ${getTimeText(props.metadata.updatedAt)}`}
				<br />
				{`Viewed ${getTimeText(props.metadata.viewedAt)}`}
			</li>
		</ul>
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
