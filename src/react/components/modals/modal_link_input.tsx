import { faLink, faTag } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ComponentProps, useEffect, useRef, useState } from "react";
import { Modal, ModalProps } from "../modal";

export function ModalLinkInput(
	props: ModalProps & {
		initialUrl: string | undefined;
		initialLabel: string | undefined;
		onSubmit: (url: string, label: string) => void;
	}
) {
	return (
		<Modal close={props.close} isActive={props.isActive}>
			<InnerModal {...props} />
		</Modal>
	);
}

function InnerModal(props: ComponentProps<typeof ModalLinkInput>) {
	const [url, setUrl] = useState(props.initialUrl ?? "");
	const [label, setLabel] = useState(props.initialLabel ?? "");

	const ref = useRef<HTMLInputElement>(null);

	useEffect(() => {
		ref.current?.focus();
	}, [ref]);

	return (
		<form method="dialog" className="modal-box w-fit bg-base-200 pb-4">
			<div className="form-control flex flex-col gap-4">
				<div className="flex flex-col gap-2">
					<div className="input-group-sm input-group">
						<span className="flex w-8 flex-col items-center justify-center bg-base-300 p-0">
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
						<span className="flex w-8 flex-col items-center justify-center bg-base-300  p-0">
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
							props.onSubmit(url, label);
							props.close();
						}}
					>
						Set
					</button>
					<button
						className="btn-sm btn ml-auto w-1/2"
						onClick={props.close}
					>
						Remove
					</button>
				</div>
			</div>
		</form>
	);
}
