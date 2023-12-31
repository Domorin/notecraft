import { faLink, faTag } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ComponentProps, useEffect, useRef, useState } from "react";
import { BaseModalProps, Modal } from "./components/modal";

export function EditorLinkInputModal(props: {
	initialHref: string | undefined;
	initialTitle: string | undefined;
	onSubmit: (opts: { href: string; title: string }) => void;
	onRemove: () => void;
	closeModal: () => void;
}) {
	return (
		<Modal closeModal={props.closeModal}>
			<InnerModal {...props} closeModal={props.closeModal} />
		</Modal>
	);
}

function InnerModal(
	props: BaseModalProps & ComponentProps<typeof EditorLinkInputModal>
) {
	const [url, setUrl] = useState(props.initialHref ?? "");
	const [label, setLabel] = useState(props.initialTitle ?? "");

	const ref = useRef<HTMLInputElement>(null);

	useEffect(() => {
		ref.current?.focus();
	}, []);

	return (
		<div className="form-control flex flex-col gap-4">
			<div className="flex flex-col gap-2">
				<div className="input-group-sm input-group">
					<span className="bg-base-300 flex w-8 flex-col items-center justify-center p-0">
						<FontAwesomeIcon icon={faLink} />
					</span>
					<input
						ref={ref}
						type="text"
						placeholder="URL"
						className="input-bordered input input-sm bg-base-100"
						value={url}
						onChange={(e) => {
							setUrl(e.target.value);
						}}
					/>
				</div>
				<div className="input-group-sm input-group">
					<span className="bg-base-300 flex w-8 flex-col items-center justify-center  p-0">
						<FontAwesomeIcon icon={faTag} />
					</span>
					<input
						type="text"
						placeholder="Label"
						className="input-bordered input input-sm bg-base-100"
						value={label}
						onChange={(e) => {
							setLabel(e.target.value);
						}}
					/>
				</div>
			</div>
			<div className="flex w-full">
				<button
					type="submit"
					className="btn-sm btn w-1/2"
					onClick={() => {
						props.onSubmit({
							href: url,
							title: label,
						});
						props.closeModal();
					}}
				>
					Set
				</button>
				<button
					className="btn-sm btn ml-auto w-1/2"
					onClick={() => {
						props.onRemove();
						props.closeModal();
					}}
				>
					Remove
				</button>
			</div>
		</div>
	);
}
