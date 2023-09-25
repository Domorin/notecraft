import { faChevronDown } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import classNames from "classnames";
import Cookies from "js-cookie";
import {
	MutableRefObject,
	useCallback,
	useEffect,
	useRef,
	useState,
} from "react";
import { createPortal } from "react-dom";
import { useOnClickOutside } from "usehooks-ts";
import { useAttachChildToParent } from "../hooks/use_attach_child_to_parent";

export const themes = [
	"light",
	"dark",
	"lofi",
	"brutal",
	"cupcake",
	"bumblebee",
	"emerald",
	"corporate",
	"synthwave",
	"retro",
	"cyberpunk",
	"valentine",
	"halloween",
	"garden",
	"forest",
	"aqua",
	"pastel",
	"fantasy",
	"wireframe",
	"black",
	"luxury",
	"dracula",
	"cmyk",
	"autumn",
	"business",
	"acid",
	"lemonade",
	"night",
	"coffee",
	"winter",
] as const;

function uppercaseFirstLetter(str: string) {
	return str.charAt(0).toUpperCase() + str.slice(1);
}

export default function ThemePicker() {
	const [selectedTheme, setTheme] = useState(
		themes[0] as (typeof themes)[number]
	);

	const [isOpen, setIsOpen] = useState(false);

	const updateTheme = useCallback((theme: (typeof themes)[number]) => {
		setTheme(theme);

		Cookies.set("theme", theme, {
			sameSite: "lax",
			expires: 365,
		});
		document.documentElement.setAttribute("data-theme", theme);
	}, []);

	useEffect(() => {
		const defaultTheme =
			window.matchMedia &&
			window.matchMedia("(prefers-color-scheme: dark)").matches
				? "dark"
				: "light";

		updateTheme(
			(Cookies.get("theme") as (typeof themes)[number]) ?? defaultTheme
		);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const parentRef = useRef(null as HTMLLabelElement | null);

	return (
		<div className="dropdown-end dropdown">
			<label
				ref={parentRef}
				title={"Theme"}
				tabIndex={0}
				onClick={() => setIsOpen(true)}
				className="border-neutral rounded-btn btn btn-sm flex cursor-pointer items-center gap-1 border text-sm"
			>
				<div>{uppercaseFirstLetter(selectedTheme)}</div>
				<FontAwesomeIcon className="text-xs" icon={faChevronDown} />
			</label>
			{isOpen &&
				createPortal(
					<ThemeDropdown
						selectedTheme={selectedTheme}
						updateTheme={updateTheme}
						parentRef={parentRef}
						close={() => setIsOpen(false)}
					/>,
					document.body
				)}
		</div>
	);
}

export function ThemeDropdown(props: {
	updateTheme: (theme: (typeof themes)[number]) => void;
	selectedTheme: (typeof themes)[number];
	close: () => void;
	parentRef: MutableRefObject<HTMLLabelElement | null>;
}) {
	const childRef = useRef(null as HTMLDivElement | null);

	useAttachChildToParent(props.parentRef, childRef, (parent, child) => {
		return {
			relativeX: parent.width / 2 - child.width / 2,
			relativeY: child.height / 2 + parent.height / 2,
		};
	});

	useOnClickOutside(childRef, props.close);

	return (
		<div
			className="rounded-box bg-base-100 menu border-neutral absolute z-[1001] mt-2 w-52 border p-2 shadow"
			ref={childRef}
		>
			<ul
				tabIndex={0}
				className="dropdown-content  max-h-80 flex-nowrap overflow-auto"
			>
				{themes.map((theme) => (
					<li key={theme} onClick={() => props.updateTheme(theme)}>
						<a
							className={classNames({
								active: theme === props.selectedTheme,
							})}
						>
							{uppercaseFirstLetter(theme)}
						</a>
					</li>
				))}
			</ul>
		</div>
	);
}
