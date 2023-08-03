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

	console.log(metadata.updatedAt);

	const updatedAt = DateTime.fromJSDate(metadata.updatedAt);
	const [dateText, setDateText] = useState(updatedAt.toRelative());

	useEffect(() => {
		setDateText(updatedAt.toRelative());
		const timer = setInterval(
			() => setDateText(updatedAt.toRelative()),
			1000
		);

		return () => clearInterval(timer);
	}, [props.isSaving, updatedAt]);

	return (
		<div className="ml-auto flex gap-2 text-sm opacity-50">
			<div>{props.isSaving ? "Saving..." : `Saved ${dateText}`}</div>
			<div>{metadata.views} Views</div>
		</div>
	);
}
