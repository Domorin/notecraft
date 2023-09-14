import { withSessionSsr } from "@/lib/session";
import MainPageContainer from "@/react/components/main_page_container";
import WelcomeNote from "@/react/components/note/welcome_note";
import { appRouter } from "@/server/trpc/routers/_app";
import { createServerSideHelpers } from "@trpc/react-query/server";
import { GetServerSidePropsContext } from "next";
import superjson from "superjson";
import * as cookie from "cookie";
import { WelcomePageSlug } from "@/lib/default_pages";

export type RootPageProps = {
	sidebarOpened: boolean;
};

export default function IndexPage(props: RootPageProps) {
	return (
		<MainPageContainer sidebarOpened={props.sidebarOpened}>
			<WelcomeNote />
		</MainPageContainer>
	);
}

export const getServerSideProps = withSessionSsr(
	async function getServerSideProps(context: GetServerSidePropsContext) {
		const helpers = createServerSideHelpers({
			router: appRouter,
			ctx: {
				api: {
					req: context.req,
					res: context.res,
				},
			},
			transformer: superjson,
		});

		const sidebarOpened =
			cookie.parse(context.req.headers.cookie || "")["sidebarOpen"] ===
			"false"
				? false
				: true;

		// Server side prefetch only note's content
		// We can prefetch other things as well, but content is most important and we do not want to increase time to first byte
		await Promise.all([
			helpers.note.htmlContent.prefetch({
				slug: WelcomePageSlug,
			}),
			helpers.note.metadata.prefetch({
				slug: WelcomePageSlug,
			}),
		]);
		return {
			props: {
				trpcState: helpers.dehydrate(),
				sidebarOpened,
			},
		};
	}
);
