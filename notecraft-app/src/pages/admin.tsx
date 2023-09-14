import MainPageContainer from "@/react/components/main_page_container";
import { Spinner } from "@/react/components/spinner";
import { trpc } from "@/utils/trpc";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { RootPageProps } from ".";
import { defaultGetServerSideProps } from "@/lib/default_server_side_props";

type State = "Overview" | "WelcomeMessage";

export default function AdminPage(props: RootPageProps) {
	const isAdminQuery = trpc.admin.isAdmin.useQuery();
	const [state, setState] = useState("Overview" as State);

	if (!isAdminQuery.isSuccess) {
		return (
			<MainPageContainer {...props}>
				<Spinner />
			</MainPageContainer>
		);
	}

	let children: JSX.Element | undefined;
	switch (state) {
		case "Overview":
			children = <Overview setState={setState} />;
			break;
		case "WelcomeMessage":
			children = <WelcomeMessage />;
			break;
	}

	return (
		<MainPageContainer {...props}>
			{state !== "Overview" && (
				<button
					className="btn btn-ghost absolute"
					onClick={() => setState("Overview")}
				>
					Back
				</button>
			)}
			{children}
		</MainPageContainer>
	);
}

function Overview(props: { setState: (state: State) => void }) {
	return (
		<div className="flex h-full w-full flex-col items-center">
			<h1 className="my-8 text-3xl font-bold">Admin Panel</h1>
			<div className="flex h-full w-full flex-col items-center justify-center">
				<button
					className="btn btn-primary"
					onClick={() => props.setState("WelcomeMessage")}
				>
					Edit Welcome Message
				</button>
			</div>
		</div>
	);
}

function WelcomeMessage() {
	const router = useRouter();

	const getOrCreateWelcomeMessageMutation =
		trpc.admin.getOrCreateWelcomeMessage.useMutation({
			onSuccess: (data) => {
				router.push(`/${data.slug}`);
			},
		});

	useEffect(() => {
		getOrCreateWelcomeMessageMutation.mutate();
	}, [getOrCreateWelcomeMessageMutation]);

	return (
		<div className="flex h-full w-full items-center justify-center">
			Loading welcome message...
		</div>
	);
}

export const getServerSideProps = defaultGetServerSideProps();
