import { useEffect, useState } from "react";
import * as Y from "yjs";
import { CustomProvider } from "../../../../../common/yjs/custom_provider";
import type {
	CustomMessage,
	UserPresence,
} from "../../../../../ws/server/types";
import { useUpdateMetadata } from "../../hooks/trpc/use_update_metadata";
import { Spinner } from "../spinner";
import { WysiwygEditor } from "./markdown_editor";
import { Presences, Presence } from "./presences";

export function TextInput(props: {
	slug: string;
	doc: Y.Doc;
	setContent: (content: string) => void;
}) {
	const [provider, setProvider] = useState<CustomProvider | undefined>(
		undefined
	);
	const [presences, setPresences] = useState([] as UserPresence[]);
	const setNoteMetadata = useUpdateMetadata(props.slug);

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
						case "noteMetadataUpdate":
							const { type, ...val } = m;
							setNoteMetadata(val);
							break;
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

	if (!provider) {
		return <Spinner />;
	}

	return (
		<div className="flex h-full w-full flex-col">
			{/* <TextInputWithProvider
				{...props}
				provider={provider}
				presences={presences}
			/> */}
			<div className="relative">
				<div className="presence absolute right-0 z-[1] m-4 opacity-25 transition-all hover:opacity-100">
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
			/>
		</div>
	);
}
