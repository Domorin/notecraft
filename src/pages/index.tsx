import MainPage from "@/react/components/main";
import { useCreateNoteMutation } from "@/react/hooks/trpc/use_create_note_mutation";
import { useEffect } from "react";

export default function IndexPage() {
	const mutation = useCreateNoteMutation();

	useEffect(() => {
		mutation.mutate({});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return <MainPage />;
}
