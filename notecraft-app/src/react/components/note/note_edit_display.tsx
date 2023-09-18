import { DateTime } from "luxon";
import { useEffect, useMemo, useState } from "react";
import { useNoteMetadataQuery } from "../../hooks/trpc/use_note_metadata_query";
import { RouterOutput } from "@/server/trpc/routers/_app";

export function NoteEditDisplaySuspense(props: { slug: string }) {
	const metadata_query = useNoteMetadataQuery(props.slug);

	if (!metadata_query.isSuccess) {
		return <></>;
	}

	return <NoteEditDisplay {...props} metadata={metadata_query.data} />;
}
function NoteEditDisplay(props: {
	slug: string;
	metadata: RouterOutput["note"]["metadata"];
}) {
	const { metadata } = props;

	const dateForText = useMemo(
		() =>
			metadata.updatedAt.getTime() > Date.now()
				? new Date()
				: metadata.updatedAt,
		[metadata.updatedAt]
	);

	const [dateText, setDateText] = useState(
		DateTime.fromJSDate(dateForText).toRelative()
	);

	useEffect(() => {
		const updatedAt = DateTime.fromJSDate(dateForText);
		setDateText(updatedAt.toRelative());
		const timer = setInterval(() => {
			setDateText(updatedAt.toRelative());
		}, 1000);

		return () => clearInterval(timer);
	}, [dateForText]);

	return (
		<div className="ml-auto flex gap-2 text-sm opacity-50">
			<div suppressHydrationWarning>{`Saved ${dateText}`}</div>
			<div>{metadata.views} Views</div>
		</div>
	);
}
