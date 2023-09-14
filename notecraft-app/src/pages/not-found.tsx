import { defaultGetServerSideProps } from "@/lib/default_server_side_props";
import MainPageContainer from "@/react/components/main_page_container";
import { NotFoundContent } from "@/react/components/not_found_content";
import { RootPageProps } from ".";

export default function NotFoundPage(props: RootPageProps) {
	return (
		<MainPageContainer {...props}>
			<NotFoundContent />
		</MainPageContainer>
	);
}

export const getServerSideProps = defaultGetServerSideProps();
