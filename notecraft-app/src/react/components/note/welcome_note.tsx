import { useNoteContentQuery } from "@/react/hooks/trpc/use_note_content_query";
import { useNoteListRecent } from "@/react/hooks/use_recents";
import { useEffect } from "react";
import { StaticNote } from "../editor/static_page";
import { Spinner } from "../spinner";
import { WelcomePageSlug } from "@/lib/default_pages";

export default function WelcomeNote() {
	const contentQuery = useNoteContentQuery(WelcomePageSlug);

	const { add } = useNoteListRecent();
	useEffect(() => {
		// Add page to recents
		add(WelcomePageSlug);
	}, [add]);

	if (!contentQuery.isSuccess) {
		return <Spinner />;
	}

	return <StaticNote slug={WelcomePageSlug} />;
}
