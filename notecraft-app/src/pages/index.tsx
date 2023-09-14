import { withSessionSsr } from "@/lib/session";
import MainPageContainer from "@/react/components/main_page_container";
import WelcomeNote from "@/react/components/note/welcome_note";
import { appRouter } from "@/server/trpc/routers/_app";
import { createServerSideHelpers } from "@trpc/react-query/server";
import { GetServerSidePropsContext } from "next";
import superjson from "superjson";

export default function IndexPage() {
	return (
		<MainPageContainer>
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

		// TODO: prefetch login

		// Server side prefetch only note's content
		// We can prefetch other things as well, but content is most important and we do not want to increase time to first byte
		await Promise.all([
			helpers.user.info.prefetch(),
			helpers.note.htmlContent.prefetch({
				slug: "welcome" as string,
			}),
			helpers.note.metadata.prefetch({
				slug: "welcome" as string,
			}),
		]);
		return {
			props: {
				trpcState: helpers.dehydrate(),
			},
		};
	}
);
