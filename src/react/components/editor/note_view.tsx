import { useEffect, useState } from "react";
import * as Y from "yjs";

import { CustomMessage, UserPresence } from "../../../../common/ws/types";
import { CustomProvider } from "../../../../common/yjs/custom_provider";
import { useNoteMetadataQuery } from "../../hooks/trpc/use_note_metadata_query";
import { useUpdateMetadata } from "../../hooks/trpc/use_update_metadata";
import { WysiwygEditor } from "./markdown_editor";
import { Presences } from "./presences";
import { StaticNote } from "./static_page";

export function NoteView(props: { slug: string; doc: Y.Doc }) {
	const { slug, doc } = props;

	const [provider, setProvider] = useState<CustomProvider | undefined>(
		undefined
	);

	const [isConnected, setIsSynced] = useState(false);

	const [presences, setPresences] = useState([] as UserPresence[]);
	const setNoteMetadata = useUpdateMetadata(props.slug);
	const metadataQuery = useNoteMetadataQuery(props.slug);

	useEffect(() => {
		const provider = new CustomProvider("ws://localhost:4444", slug, doc, {
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
		});

		provider.on("synced", (synced: boolean) => {
			setIsSynced(synced);
		});

		setProvider(provider);

		return () => {
			doc.destroy();
			provider?.destroy();
		};
	}, [doc, slug, setNoteMetadata]);

	// const [isEditing, setIsEditing] = useState(false);

	// const editingButton = (
	// 	<div className="flex w-full">
	// 		<button
	// 			className="btn-primary btn absolute right-0 z-50 ml-auto"
	// 			onClick={() => setIsEditing(!isEditing)}
	// 		>
	// 			{isEditing ? "Editing" : "Viewing"}
	// 		</button>
	// 	</div>
	// );

	// TODO: this is for debug purposes; should remove
	const editingButton = <></>;

	const isLoaded = provider && isConnected && metadataQuery.isSuccess;

	const isReadOnly =
		metadataQuery.isSuccess &&
		!metadataQuery.data.isCreatedByYou &&
		!metadataQuery.data.allowAnyoneToEdit;

	return (
		<>
			{" "}
			{editingButton}
			<div className="relative flex h-full w-full flex-col">
				<div className="presence absolute z-[1] my-2 flex w-full min-w-0 items-center gap-2 px-4 opacity-25 transition-all hover:opacity-100">
					{isReadOnly && (
						<div className="badge badge-neutral">View Only</div>
					)}
					<div className="ml-auto">
						<Presences
							presences={presences}
							clientId={props.doc.clientID}
						/>
					</div>
				</div>
				{isLoaded ? (
					<WysiwygEditor
						{...props}
						provider={provider}
						presences={presences}
						metadata={metadataQuery.data}
					/>
				) : (
					<StaticNote />
				)}
			</div>
		</>
	);
}
