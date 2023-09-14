import { defaultGetServerSideProps } from "@/lib/default_server_side_props";
import MainPageContainer from "@/react/components/main_page_container";
import Note from "@/react/components/note/note";
import { usePageSlug } from "@/react/hooks/use_page_id";
import { appRouter } from "@/server/trpc/routers/_app";
import { createServerSideHelpers } from "@trpc/react-query/server";
import { GetServerSidePropsContext } from "next";
import superjson from "superjson";
import { RootPageProps } from ".";

export default function NoteWithId(props: RootPageProps) {
	const slug = usePageSlug();
	return (
		<MainPageContainer {...props}>
			<Note key={slug} />
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
				slug: context.query.slug as string,
			}),
			helpers.note.metadata.prefetch({
				slug: context.query.slug as string,
			}),
		]);
		return {
			trpcState: helpers.dehydrate(),
		};
	}
);
