import {
	faEdit,
	faEllipsis,
	faLink,
	faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import classNames from "classnames";
import { useRef, useState } from "react";
import { RouterOutput } from "@/server/routers/_app";
import { useCopyToClipboard, useOnClickOutside } from "usehooks-ts";
import { getRelativeTimeText } from "./sidebar";

export function SidebarElementMenu(props: {
	metadata: RouterOutput["note"]["metadata"];
	openTitleInput: () => void;
}) {
	const [isOpen, setIsOpen] = useState(false);

	const ref = useRef(null as HTMLUListElement | null);

	useOnClickOutside(ref, () => {
		if (isOpen) setIsOpen(false);
	});

	const [_, setCopied] = useCopyToClipboard();

	return (
		<div
			className={classNames("dropdown ml-auto", {
				"dropdown-open": isOpen,
			})}
		>
			<label
				className="btn-ghost btn-xs btn invisible cursor-pointer p-1 group-hover:visible"
				onClick={(e) => {
					e.preventDefault();
					setIsOpen(true);
				}}
			>
				<FontAwesomeIcon icon={faEllipsis} />
			</label>
			<ul
				className="dropdown-content menu rounded-box z-[1] w-fit min-w-[14rem] bg-base-300 py-2 text-base-content shadow"
				ref={ref}
			>
				<li>
					<div className="flex items-center gap-2">
						<div className="flex w-6 justify-center">
							<FontAwesomeIcon icon={faTrash} />
						</div>
						Delete
					</div>
				</li>
				<li>
					<div
						className="flex items-center gap-2"
						onClick={props.openTitleInput}
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
								window.location.origin +
									"/" +
									props.metadata.slug
							);
							setIsOpen(false);
						}}
					>
						<div className="flex w-6 justify-center">
							<FontAwesomeIcon icon={faLink} />
						</div>
						Copy Link
					</div>
				</li>
				<div className="divider my-0"></div>
				<li className="px-2 text-xs opacity-40">
					{`Edited ${getRelativeTimeText(props.metadata.updatedAt)}`}
					<br />
					{`Viewed ${getRelativeTimeText(props.metadata.viewedAt)}`}
				</li>
			</ul>
		</div>
	);
}
