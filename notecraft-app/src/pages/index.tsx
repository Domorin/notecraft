import { WelcomePageSlug } from "@/lib/default_pages";
import { defaultGetServerSideProps } from "@/lib/default_server_side_props";
import { IronSessionUser } from "@/lib/session";
import MainPageContainer from "@/react/components/main_page_container";
import WelcomeNote from "@/react/components/note/welcome_note";
import { appRouter } from "@/server/trpc/routers/_app";
import { createServerSideHelpers } from "@trpc/react-query/server";
import { GetServerSidePropsContext } from "next";
import superjson from "superjson";

export type RootPageProps = {
	sidebarOpened: boolean;
	user: IronSessionUser | undefined;
};

export default function IndexPage(props: RootPageProps) {
	return (
		<MainPageContainer {...props}>
			<WelcomeNote />
		</MainPageContainer>
	);
}

export const getServerSideProps = defaultGetServerSideProps(
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
			trpcState: helpers.dehydrate(),
		};
	}
);
