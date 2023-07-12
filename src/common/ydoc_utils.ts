// https://docs.yjs.dev/api/document-updates
import { encodeStateAsUpdateV2, Doc, applyUpdateV2 } from "yjs";

export function encodeYDocContent(ydoc: Doc) {
	return encodeStateAsUpdateV2(ydoc);
}

export function parseYDocContent(content: Uint8Array) {
	const ydoc = new Doc();
	applyUpdateV2(ydoc, content);
	return ydoc;
}
