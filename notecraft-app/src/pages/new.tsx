import { defaultGetServerSideProps } from "@/lib/default_server_side_props";
import MainPageContainer from "@/react/components/main_page_container";
import { Spinner } from "@/react/components/spinner";
import { useCreateNoteMutation } from "@/react/hooks/trpc/use_create_note_mutation";
import { useEffect } from "react";
import { RootPageProps } from ".";

export default function NewPage(props: RootPageProps) {
	const mutation = useCreateNoteMutation();

	useEffect(() => {
		mutation.mutate({});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<MainPageContainer {...props}>
			<Spinner />
		</MainPageContainer>
	);
}

export const getServerSideProps = defaultGetServerSideProps();
