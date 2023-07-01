import { faPalette } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

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
];

export function ThemePicker() {
	return (
		<details className="dropdown-end dropdown absolute right-4 top-4 mb-32">
			<summary className="btn m-1"><FontAwesomeIcon icon={faPalette} /> theme</summary>
			<ul className="dropdown-content menu rounded-box z-[1] w-52 bg-base-100 p-2 shadow max-h-80 overflow-scroll flex-nowrap">
				{themes.map((theme) => <li key={theme} onClick={() => document.documentElement.setAttribute("data-theme", theme)}><a>{theme}</a></li>)}
			</ul>
		</details>
	);
}
