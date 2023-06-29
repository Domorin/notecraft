import { trpc } from "@/utils/trpc";
import { useRouter } from "next/router";
import { useEffect } from "react";
import MainPage from "./react/components/main";

export default function IndexPage() {
	const router = useRouter();
	const context = trpc.useContext();
	const mutation = trpc.createPage.useMutation({
		onSuccess: (data) => {
			context.getAllSlugs.setData(undefined, (slugs) => {
				if (!slugs) {
					return slugs;
				}

				return [
					{ slug: data.slug, updatedAt: data.updatedAt },
					...slugs,
				];
			});
			router.push(`/${data.slug}`);
		},
	});

	useEffect(() => {
		mutation.mutate();
	}, []);

	return <MainPage />;
}
