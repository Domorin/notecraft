import { faCheck, faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useRef, useState } from "react";
import { RouterOutput } from "@/server/routers/_app";
import { useUpdateTitleMutation } from "../../hooks/trpc/use_update_title_mutation";
import { titleLimiter } from "@/lib/validators";
import { getNoteTitle } from "../../utils/get_note_title";

export function SidebarElementTitleInput(props: {
	metadata: RouterOutput["note"]["metadata"];
	closeInput: () => void;
}) {
	const [input, setInput] = useState(getNoteTitle(props.metadata));

	const inputRef = useRef(null as HTMLInputElement | null);

	const mutation = useUpdateTitleMutation(props.metadata.slug);

	useEffect(() => {
		inputRef.current?.focus();
	}, [inputRef]);

	return (
		<div className="flex w-full gap-2">
			<input
				ref={inputRef}
				className="w-full bg-inherit"
				onChange={(e) => {
					const val = e.target.value;
					if (
						titleLimiter.maxLength &&
						val.length > titleLimiter.maxLength
					) {
						return;
					}
					setInput(e.target.value);
				}}
				value={input}
			/>
			<div>
				<button
					className="btn-ghost btn-xs"
					onClick={() => {
						mutation.mutate({
							slug: props.metadata.slug,
							title: input,
						});
						props.closeInput();
					}}
					disabled={!titleLimiter.safeParse(input).success}
				>
					<FontAwesomeIcon icon={faCheck} />
				</button>
				<button className="btn-ghost btn-xs" onClick={props.closeInput}>
					<FontAwesomeIcon icon={faXmark} />
				</button>
			</div>
		</div>
	);
}
