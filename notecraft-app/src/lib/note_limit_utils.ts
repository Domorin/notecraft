export const CharacterLimit = 10000;

export function calculateAttrLength(node: { attrs: Record<string, string> }) {
	if (!node.attrs?.href && !node.attrs?.src) {
		return 0;
	}
	return ((node.attrs?.href?.length ?? 0) +
		(node.attrs?.src?.length ?? 0)) as number;
}
