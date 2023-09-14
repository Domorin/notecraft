import MainPageContainer from "@/react/components/main_page_container";
import { NotFoundContent } from "@/react/components/not_found_content";
import * as cookie from "cookie";
import { RootPageProps } from ".";
import { GetServerSidePropsContext } from "next";
import { withSessionSsr } from "@/lib/session";

export default function NotFoundPage(props: RootPageProps) {
	return (
		<MainPageContainer sidebarOpened={props.sidebarOpened}>
			<NotFoundContent />
		</MainPageContainer>
	);
}

export const getServerSideProps = withSessionSsr(
	async function getServerSideProps(context: GetServerSidePropsContext) {
		const sidebarOpened =
			cookie.parse(context.req.headers.cookie || "")["sidebarOpen"] ===
			"false"
				? false
				: true;

		// Server side prefetch only note's content
		// We can prefetch other things as well, but content is most important and we do not want to increase time to first byte

		return {
			props: {
				sidebarOpened,
			},
		};
	}
);
