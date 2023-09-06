import { useRouter } from "next/router";

export function NotFoundContent() {
	const router = useRouter();

	const text = router.query.slug
		? `Page '${router.query.slug}' not found!`
		: "Page not found!";

	return (
		<div className="mx-auto my-auto flex h-full w-full items-center justify-center">
			{text}
		</div>
	);
}
