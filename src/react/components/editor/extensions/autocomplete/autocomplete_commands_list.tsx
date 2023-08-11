import { useAttachChildToParent } from "@/react/hooks/use_relative_position";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import classNames from "classnames";
import {
	ForwardedRef,
	KeyboardEvent,
	forwardRef,
	useCallback,
	useImperativeHandle,
	useRef,
	useState,
} from "react";
import { createPortal } from "react-dom";
import { CommandSuggestionProps } from "./autocomplete_extension";

function selectItem(props: AutocompleteCommandsListProps, index: number) {
	const item = props.items[index];

	if (item) {
		// TODO: try item.command as well
		item.command({
			editor: props.editor,
			range: props.range,
			origin: "Menu",
		});
	}

	// props.close();
}

export type AutocompleteCommandsListProps = CommandSuggestionProps;

// AutocompleteCommandsList
// maybe forward ref?
export const AutocompleteCommandsList = forwardRef(
	function AutocompleteCommandsList(
		props: AutocompleteCommandsListProps,
		ref: ForwardedRef<{
			onkeydown: (
				event: KeyboardEvent<HTMLDivElement>
			) => true | undefined;
		}>
	) {
		const [selectedIndex, setSelectedIndex] = useState(0);
		const positionRef = useRef<HTMLDivElement>(null);
		const parentRef = useRef(props.decorationNode as HTMLSpanElement);

		const onKeyDown = useCallback(
			(event: KeyboardEvent<HTMLDivElement>) => {
				switch (event.key) {
					case "ArrowUp":
						setSelectedIndex((index) => {
							return (
								(index - 1 + props.items.length) %
								props.items.length
							);
						});
						return true;
					case "ArrowDown":
						setSelectedIndex((index) => {
							return ++index % props.items.length;
						});
						return true;
					case "Enter":
						selectItem(props, selectedIndex);
						return true;
					// case "Escape":
					// 	// props.close();
					// 	break;
				}
			},
			[props, selectedIndex]
		);

		// Allow parent to access this function
		useImperativeHandle(ref, () => {
			return {
				onkeydown: onKeyDown,
			};
		});

		useAttachChildToParent(parentRef, positionRef, (parent) => ({
			relativeX: 0,
			relativeY: parent.height,
		}));

		return createPortal(
			<div className="absolute w-fit" ref={positionRef}>
				<div
					className="menu rounded-box menu-xs absolute w-fit bg-base-300"
					tabIndex={0}
					// eslint-disable-next-line @typescript-eslint/no-explicit-any
					ref={ref as any}
				>
					{/* {props.items.length === 0 && <div>No commands found</div>} */}
					{props.items.map((item, index) => (
						<li key={item.title} tabIndex={-1}>
							<button
								className={classNames({
									"flex gap-2 bg-base-content bg-opacity-10":
										index === selectedIndex,
								})}
								key={index}
								onClick={() => selectItem(props, index)}
							>
								<FontAwesomeIcon icon={item.icon} />
								{item.title}
							</button>
						</li>
					))}
				</div>
			</div>,
			document.body
		);
	}
);
