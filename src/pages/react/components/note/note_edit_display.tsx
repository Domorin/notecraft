import { DateTime } from "luxon";
import { useEffect, useState } from "react";
import { useNoteMetadataQuery } from "../../hooks/trpc/use_note_metadata_query";
import { RouterOutput } from "@/server/routers/_app";

export function NoteEditDisplaySuspense(props: {
	slug: string;
	isSaving: boolean;
}) {
	const metadata_query = useNoteMetadataQuery(props.slug);

	if (!metadata_query.isSuccess) {
		return <></>;
	}

	return <NoteEditDisplay {...props} metadata={metadata_query.data} />;
}
function NoteEditDisplay(props: {
	slug: string;
	isSaving: boolean;
	metadata: RouterOutput["note"]["metadata"];
}) {
	const { metadata } = props;

	const [dateText, setDateText] = useState(
		DateTime.fromJSDate(metadata.updatedAt).toRelative()
	);

	useEffect(() => {
		const updatedAt = DateTime.fromJSDate(metadata.updatedAt);
		setDateText(updatedAt.toRelative());
		const timer = setInterval(() => {
			setDateText(updatedAt.toRelative());
		}, 1000);

		return () => clearInterval(timer);
	}, [metadata.updatedAt]);

	return (
		<div className="ml-auto flex gap-2 text-sm opacity-50">
			<div>{props.isSaving ? "Saving..." : `Saved ${dateText}`}</div>
			<div>{metadata.views} Views</div>
		</div>
	);
}
