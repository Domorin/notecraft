import { faPalette } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import classNames from "classnames";
import Cookies from "js-cookie";
import { useCallback, useEffect, useState } from "react";

const themes = [
	"light",
	"dark",
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
	"lofi",
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

export default function ThemePicker() {
	const [selectedTheme, setTheme] = useState(
		themes[0] as (typeof themes)[number]
	);

	const updateTheme = useCallback((theme: (typeof themes)[number]) => {
		setTheme(theme);

		Cookies.set("theme", theme, {
			sameSite: "strict",
			expires: 365,
		});
		document.documentElement.setAttribute("data-theme", theme);
	}, []);

	useEffect(() => {
		updateTheme(
			(Cookies.get("theme") as (typeof themes)[number]) ?? themes[0]
		);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<details className="dropdown-end dropdown absolute right-4 top-4 mb-32">
			<summary className="btn m-1">
				<FontAwesomeIcon icon={faPalette} /> theme
			</summary>
			<ul className="dropdown-content menu rounded-box z-[10] max-h-80 w-52 flex-nowrap overflow-scroll bg-base-100 p-2 shadow">
				{themes.map((theme) => (
					<li key={theme} onClick={() => updateTheme(theme)}>
						<a
							className={classNames({
								active: theme === selectedTheme,
							})}
						>
							{theme}
						</a>
					</li>
				))}
			</ul>
		</details>
	);
}
