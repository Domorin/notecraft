import React, { useRef } from "react";

// https://github.com/daisyui/react-daisyui/blob/d0ad289c74db0e9a0f8b978c5dc7781f6f9babec/src/Modal/Modal.tsx#L62
// Use FORWARD REF!
export function Modal(props: {
	children: React.ReactNode;
	ref: React.RefObject<HTMLDialogElement>;
}) {
	return (
		<div>
			<dialog id="modal" className="modal" ref={props.ref}>
				<form method="dialog" className="modal-box">
					<h3 className="text-lg font-bold">Hello!</h3>
					<p className="py-4">
						Press ESC key or click outside to close
					</p>
				</form>
				<form method="dialog" className="modal-backdrop">
					<button>close</button>
				</form>
			</dialog>
		</div>
	);
}
