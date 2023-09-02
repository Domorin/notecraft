import { useEffect, useRef, useState } from "react";
import { BaseModalProps, Modal } from "./components/modal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faImage } from "@fortawesome/free-solid-svg-icons";

export function EditorImageInputModal(
	props: BaseModalProps & {
		onSubmit: (params: {
			src: string;
			alt?: string;
			title?: string;
			inline?: boolean;
		}) => void;
	}
) {
	const [imageHref, setImageHref] = useState("");

	const ref = useRef<HTMLInputElement>(null);

	useEffect(() => {
		ref.current?.focus();
	}, []);

	return (
		<Modal closeModal={props.closeModal}>
			<div className="form-control flex flex-col gap-4">
				<div>
					<div className="input-group-sm input-group">
						<span className="bg-base-300 flex w-8 flex-col items-center justify-center p-0">
							<FontAwesomeIcon icon={faImage} />
						</span>
						<input
							ref={ref}
							type="text"
							placeholder="Image URL"
							className="input-bordered input input-sm bg-base-100"
							value={imageHref}
							onChange={(e) => {
								setImageHref(e.target.value);
							}}
						/>
					</div>
				</div>
				<div className="flex w-full">
					<button
						type="submit"
						className="btn-sm btn w-full"
						disabled={!imageHref}
						onClick={() => {
							props.onSubmit({ src: imageHref });
							props.closeModal();
						}}
					>
						Set
					</button>
				</div>
			</div>
		</Modal>
	);
}
