import { useEffect, useState } from "react";
import * as Y from "yjs";

import { CustomMessage, UserPresence } from "../../../../common/ws/types";
import { CustomProvider } from "../../../../common/yjs/custom_provider";
import { useNoteMetadataQuery } from "../../hooks/trpc/use_note_metadata_query";
import { useUpdateMetadata } from "../../hooks/trpc/use_update_metadata";
import { Spinner } from "../spinner";
import { WysiwygEditor, baseExtensions } from "./markdown_editor";
import { Presences } from "./presences";
import { generateHTML } from "@tiptap/html";
import { yDocToProsemirrorJSON } from "y-prosemirror";

export function TextInput(props: { slug: string; doc: Y.Doc }) {
	const [provider, setProvider] = useState<CustomProvider | undefined>(
		undefined
	);
	const [presences, setPresences] = useState([] as UserPresence[]);
	const setNoteMetadata = useUpdateMetadata(props.slug);
	const metadata_query = useNoteMetadataQuery(props.slug);

	useEffect(() => {
		const provider = new CustomProvider(
			"ws://localhost:4444",
			props.slug,
			props.doc,
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
		setProvider(provider);

		return () => {
			props.doc.destroy();
			provider?.destroy();
		};
	}, [props.doc, props.slug, setNoteMetadata]);

	const [isEditing, setIsEditing] = useState(false);

	const editingButton = (
		<button
			className="btn-primary btn absolute z-50"
			onClick={() => setIsEditing(!isEditing)}
		>
			{isEditing ? "Editing" : "Viewing"}
		</button>
	);

	if (!provider || !metadata_query.isSuccess || !isEditing) {
		const f = yDocToProsemirrorJSON(props.doc, "default");
		const html = generateHTML(f, baseExtensions);

		return (
			<>
				{editingButton}
				<div className="relative flex h-full w-full flex-col">
					<div
						className="ProseMirror"
						tabIndex={0}
						translate="no"
						dangerouslySetInnerHTML={{ __html: html }}
					></div>
				</div>
			</>
		);
	}

	const canEdit =
		metadata_query.data.allowAnyoneToEdit ||
		metadata_query.data.isCreatedByYou;

	return (
		<>
			{" "}
			{editingButton}
			<div className="relative flex h-full w-full flex-col">
				{/* <TextInputWithProvider
				{...props}
				provider={provider}
				presences={presences}
			/> */}
				<div className="presence absolute z-[1] my-2 flex w-full min-w-0 items-center gap-2 px-4 opacity-25 transition-all hover:opacity-100">
					{!canEdit && (
						<div className="badge badge-neutral">View Only</div>
					)}
					<div className="ml-auto">
						<Presences
							presences={presences}
							clientId={props.doc.clientID}
						/>
					</div>
				</div>
				<WysiwygEditor
					{...props}
					provider={provider}
					presences={presences}
					metadata={metadata_query.data}
				/>
			</div>
		</>
	);
}
