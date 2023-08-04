import MainPage from "@/react/components/main";
import { appRouter } from "@/server/routers/_app";
import { createServerSideHelpers } from "@trpc/react-query/server";
import { GetServerSidePropsContext } from "next";
import superjson from "superjson";

export default function NoteWithId() {
	return <MainPage />;
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
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
		helpers.note.content.prefetch({ slug: context.query.slug as string }),
		helpers.note.metadata.prefetch({
			slug: context.query.slug as string,
		}),
	]);
	return {
		props: {
			trpcState: helpers.dehydrate(),
		},
	};
}
