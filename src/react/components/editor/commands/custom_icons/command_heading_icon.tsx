import {
	IconDefinition,
	fa1,
	fa2,
	fa3,
	fa4,
	fa5,
	fa6,
	faHeader,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

const NumberIcons = [fa1, fa2, fa3, fa4, fa5, fa6] as const;

export function CommandHeadingIcon(props: { iconIndex: number }) {
	return (
		<div className="flex items-center">
			<FontAwesomeIcon icon={faHeader} />

			<span className="align-bottom">
				<FontAwesomeIcon
					icon={NumberIcons[props.iconIndex]}
					size="xs"
					className="!align-bottom"
				/>
			</span>
		</div>
	);
}
