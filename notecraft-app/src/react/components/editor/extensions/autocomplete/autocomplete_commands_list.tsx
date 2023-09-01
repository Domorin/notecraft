import classNames from "classnames";
import {
	ForwardedRef,
	KeyboardEvent,
	forwardRef,
	useCallback,
	useEffect,
	useImperativeHandle,
	useRef,
	useState,
} from "react";
import { createPortal } from "react-dom";
import { CommandIcon } from "../../commands/editor_commands";
import { CommandSuggestionProps } from "./autocomplete_extension";
import { useAttachChildToParent } from "@/react/hooks/use_attach_child_to_parent";

function selectItem(props: AutocompleteCommandsListProps, index: number) {
	const item = props.items[index];

	if (item) {
		props.command(item);
		// item.command({
		// 	editor: props.editor,
		// 	range: props.range,
		// 	origin: "Menu",
		// });
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

		useAttachChildToParent(parentRef, positionRef, (parent, child) => ({
			relativeX: child.width / 2,
			relativeY: child.height / 2 + parent.height / 2,
		}));

		useEffect(() => {
			if (!positionRef.current) return;
			const selectedNode = positionRef.current?.firstChild?.childNodes[
				selectedIndex
			] as HTMLLIElement;

			if (!selectedNode) return;

			const parentRect = positionRef.current.getBoundingClientRect();
			const childRect = selectedNode.getBoundingClientRect();

			const isAbove = childRect.top < parentRect.top;
			const isBelow = childRect.bottom > parentRect.bottom;

			if (isAbove || isBelow) {
				selectedNode.scrollIntoView({
					behavior: "instant",
					block: "nearest",
				});
			}
		}, [selectedIndex]);

		// TODO: bad use of useEffect, fix
		useEffect(() => {
			setSelectedIndex(0);
		}, [props.items]);

		return createPortal(
			<div
				className="rounded-box border-neutral bg-base-300 absolute max-h-64 w-fit overflow-auto border shadow"
				ref={positionRef}
			>
				<ul
					tabIndex={0}
					// eslint-disable-next-line @typescript-eslint/no-explicit-any
					ref={ref as any}
				>
					{props.items.length === 0 && (
						<div className="p-2 text-sm">No commands found</div>
					)}
					{props.items.map((item, index) => (
						<li
							key={item.title}
							tabIndex={-1}
							// className="h-full min-w-0 overflow-y-auto"
						>
							<button
								className={classNames(
									"flex w-full items-center gap-4 whitespace-nowrap p-1 pr-12 text-sm",
									{
										"bg-base-content bg-opacity-10":
											index === selectedIndex,
									}
								)}
								key={index}
								onClick={() => selectItem(props, index)}
							>
								<div
									className={classNames(
										"rounded-box flex h-12 w-12 flex-col items-center justify-center text-xl",
										{
											// "bg-base-content bg-opacity-10":
											// 	index === selectedIndex,
											"bg-base-200":
												index !== selectedIndex || true,
										}
									)}
								>
									<CommandIcon icon={item.icon} />
								</div>
								{item.title}
							</button>
						</li>
					))}
				</ul>
			</div>,
			document.body
		);
	}
);
