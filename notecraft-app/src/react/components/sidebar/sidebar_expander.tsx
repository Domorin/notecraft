import { useSidebarExpander } from "@/react/hooks/use_sidebar_expander";
import { faAnglesLeft, faAnglesRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export function SidebarExpander() {
	const { isOpen, setIsOpen } = useSidebarExpander();

	return (
		<button
			className="p-2 pb-4 opacity-50 transition-all hover:opacity-100"
			onClick={() => setIsOpen(!isOpen)}
		>
			<FontAwesomeIcon icon={isOpen ? faAnglesLeft : faAnglesRight} />
		</button>
	);
}
