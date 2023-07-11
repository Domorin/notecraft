import * as Y from "yjs";

export function encodeYDocContent(ydoc: Y.Doc) {
	return Y.encodeStateAsUpdateV2(ydoc);
}

export function parseYDocContent(content: Uint8Array) {
	const ydoc = new Y.Doc();
	Y.applyUpdate(ydoc, content);
	return ydoc;
}
