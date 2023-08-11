import { useAttachChildToParent } from "@/react/hooks/use_relative_position";
import {
	useCallback,
	useEffect,
	useImperativeHandle,
	useLayoutEffect,
	useRef,
	useState,
	KeyboardEvent,
	ComponentProps,
} from "react";
import { CommandSuggestionProps } from "./autocomplete_extension";
import { createPortal } from "react-dom";
import classNames from "classnames";

function selectItem(
	props: ComponentProps<typeof AutocompleteCommandsList>,
	index: number
) {
	const item = props.items[index];

	if (item) {
		// TODO: try item.command as well
		item.command({
			editor: props.editor,
			range: props.range,
		});
	}

	props.close();
}

// maybe forward ref?
export default function AutocompleteCommandsList(
	props: CommandSuggestionProps & { close: () => void }
) {
	const [selectedIndex, setSelectedIndex] = useState(0);

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
					break;
				case "ArrowDown":
					setSelectedIndex((index) => {
						return ++index % props.items.length;
					});
					break;
				case "Enter":
					selectItem(props, selectedIndex);
					break;
				case "Escape":
					props.close();
					break;
			}
		},
		[props, selectedIndex]
	);

	// useEffect(() => setSelectedIndex(0), [props.items]);

	const ref = useRef<HTMLDivElement>(null);
	const parentRef = useRef(props.decorationNode as HTMLSpanElement);

	useEffect(() => {
		ref.current?.focus();
	}, []);

	useAttachChildToParent(parentRef, ref, (parent) => ({
		relativeX: 0,
		relativeY: parent.height,
	}));

	return createPortal(
		<div
			className="menu rounded-box menu-xs absolute w-fit bg-base-300"
			onBlur={props.close}
			onKeyDown={onKeyDown}
			tabIndex={0}
			ref={ref}
		>
			{props.items.map((item, index) => (
				<li key={item.title} tabIndex={-1}>
					<button
						className={classNames({
							"bg-base-content bg-opacity-10":
								index === selectedIndex,
						})}
						key={index}
						onClick={() => selectItem(props, index)}
					>
						{item.title}
					</button>
				</li>
			))}
		</div>,
		document.body
	);

	return (
		<div className="items">
			{props.items.length ? (
				props.items.map((item, index) => (
					<button
						className={`item ${
							index === selectedIndex ? "is-selected" : ""
						}`}
						key={index}
						onClick={() => selectItem(index)}
					>
						{JSON.stringify(item)}
					</button>
				))
			) : (
				<div className="item">No result</div>
			)}
		</div>
	);
}
