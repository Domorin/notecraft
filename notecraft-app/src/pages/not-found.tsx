import MainPageContainer from "@/react/components/main_page_container";
import { NotFoundContent } from "@/react/components/not_found_content";

export default function NotFoundPage() {
	console.log(1);
	return (
		<MainPageContainer>
			<NotFoundContent />
		</MainPageContainer>
	);
}
