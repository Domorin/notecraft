import { ReactRenderer } from "@tiptap/react";
import { ComponentProps, KeyboardEvent, createRef } from "react";
import { AutocompleteCommandsList } from "./autocomplete_commands_list";
import { CommandSuggestionOptions } from "./autocomplete_extension";

export type AutocompleteCommandsListRenderer = ReactRenderer<
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	any,
	ComponentProps<typeof AutocompleteCommandsList>
>;

export function createRenderItems(
	showCommandAutocompleteMenu: (
		items: ComponentProps<typeof AutocompleteCommandsList> | null
	) => void
): CommandSuggestionOptions["render"] {
	// let component: AutocompleteCommandsListRenderer | null = null;
	return () => {
		const ref = createRef<{
			onkeydown: (
				event: KeyboardEvent<HTMLDivElement>
			) => true | undefined;
		}>();

		return {
			onStart: (props) => {
				showCommandAutocompleteMenu({
					...props,
					ref,
				});
			},
			onUpdate: (props) => {
				showCommandAutocompleteMenu({
					...props,
					ref,
				});
			},
			onKeyDown: (props) => {
				if (props.event.key === "Escape") {
					showCommandAutocompleteMenu(null);
					return true;
				}

				return ref?.current?.onkeydown?.(
					props.event as unknown as KeyboardEvent<HTMLDivElement>
				) as boolean;
			},
			onExit: () => {
				showCommandAutocompleteMenu(null);
			},
		};
	};
}
