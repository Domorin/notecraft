import { useEffect, useState } from "react";
import * as Y from "yjs";

import { useNoteMetadataQuery } from "../../hooks/trpc/use_note_metadata_query";
import { useUpdateMetadata } from "../../hooks/trpc/use_update_metadata";
import { WysiwygEditor } from "./markdown_editor";
import { Presences } from "./presences";
import { StaticNote } from "./static_page";
import { Spinner } from "../spinner";
import classNames from "classnames";
import { CustomProvider } from "@notecraft/common/build/src/yjs";
import {
	CustomMessage,
	UserPresence,
} from "@notecraft/common/build/src/ws_types";

export function NoteView(props: { slug: string; doc: Y.Doc }) {
	const { slug, doc } = props;

	const [provider, setProvider] = useState<CustomProvider | undefined>(
		undefined
	);

	const [isSynced, setIsSynced] = useState(false);
	const [presences, setPresences] = useState([] as UserPresence[]);
	const setNoteMetadata = useUpdateMetadata(props.slug);
	const metadataQuery = useNoteMetadataQuery(props.slug);

	useEffect(() => {
		const provider = new CustomProvider(
			`${process.env.NEXT_PUBLIC_WEB_SOCKET_PROTOCOL}://${process.env.NEXT_PUBLIC_WEB_APP_URL}`,
			slug,
			doc,
			{
				disableBc: true,

				customMessageHandler: (m: CustomMessage) => {
					switch (m.type) {
						case "presencesUpdated":
							setPresences(m.users);
							break;
						case "noteMetadataUpdate": {
							const { type: _type, ...val } = m;
							setNoteMetadata(val);
							break;
						}
					}
				},
			}
		);

		provider.on("synced", (synced: boolean) => {
			setIsSynced(synced);
		});

		setProvider(provider);

		return () => {
			doc.destroy();
			provider?.destroy();
		};
	}, [doc, slug, setNoteMetadata]);

	const isLoaded = provider && isSynced && metadataQuery.isSuccess;

	const isReadOnly =
		metadataQuery.isSuccess &&
		!metadataQuery.data.isCreatedByYou &&
		!metadataQuery.data.allowAnyoneToEdit;

	return (
		<div className="relative flex h-full w-full flex-col">
			<div
				className={classNames(
					"presence absolute z-[1] my-2 flex w-full min-w-0 items-center gap-2 px-2 transition-all hover:opacity-100",
					{
						"opacity-100": !isLoaded,
						"opacity-25": isLoaded,
					}
				)}
			>
				{isReadOnly && (
					<div className="badge badge-neutral">View Only</div>
				)}
				<div className="ml-auto">
					{isLoaded ? (
						<Presences
							presences={presences}
							clientId={props.doc.clientID}
						/>
					) : (
						<Spinner />
					)}
				</div>
			</div>
			{isLoaded ? (
				<WysiwygEditor
					key={props.slug}
					{...props}
					provider={provider}
					presences={presences}
					metadata={metadataQuery.data}
				/>
			) : (
				<StaticNote slug={props.slug} />
			)}
		</div>
	);
}
