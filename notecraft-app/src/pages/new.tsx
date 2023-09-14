import MainPageContainer from "@/react/components/main_page_container";
import { Spinner } from "@/react/components/spinner";
import { useCreateNoteMutation } from "@/react/hooks/trpc/use_create_note_mutation";
import { GetServerSidePropsContext } from "next";
import { useEffect } from "react";
import * as cookie from "cookie";
import { RootPageProps } from ".";
import { withSessionSsr } from "@/lib/session";

export default function NewPage(props: RootPageProps) {
	const mutation = useCreateNoteMutation();

	useEffect(() => {
		mutation.mutate({});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<MainPageContainer sidebarOpened={props.sidebarOpened}>
			<Spinner />
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
