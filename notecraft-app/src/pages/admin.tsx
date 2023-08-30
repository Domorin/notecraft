import MainPageContainer from "@/react/components/main_page_container";
import { useNoteContentQuery } from "@/react/hooks/trpc/use_note_content_query";
import { useState } from "react";

type State = "Overview" | "WelcomeMessage";

export default function AdminPage() {
	const [state, setState] = useState("Overview" as State);

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
		<MainPageContainer>
			{state !== "Overview" && (
				<button
					className="btn btn-ghost"
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
	useNoteContentQuery("admin");

	return <div>Welcome Message</div>;
}
