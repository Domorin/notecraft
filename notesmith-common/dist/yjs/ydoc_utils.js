// https://docs.yjs.dev/api/document-updates
import { encodeStateAsUpdateV2, Doc, applyUpdateV2 } from "yjs";
export function encodeYDocContent(ydoc) {
    return encodeStateAsUpdateV2(ydoc);
}
export function parseYDocContent(content) {
    const ydoc = new Doc();
    applyUpdateV2(ydoc, content);
    return ydoc;
}
