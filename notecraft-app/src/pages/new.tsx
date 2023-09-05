import MainPageContainer from "@/react/components/main_page_container";
import { Spinner } from "@/react/components/spinner";
import { useCreateNoteMutation } from "@/react/hooks/trpc/use_create_note_mutation";
import { useEffect } from "react";

export default function NewPage() {
	const mutation = useCreateNoteMutation();

	useEffect(() => {
		mutation.mutate({});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<MainPageContainer>
			<Spinner />
		</MainPageContainer>
	);
}
