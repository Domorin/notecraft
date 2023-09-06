import MainPageContainer from "@/react/components/main_page_container";
import { NotFoundContent } from "@/react/components/not_found_content";
import { useRouter } from "next/router";

export default function NotFoundPage() {
	return (
		<MainPageContainer>
			<NotFoundContent />
		</MainPageContainer>
	);
}
