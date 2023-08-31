import { RouterOutput } from "@/server/trpc/routers/_app";

export function getNoteTitle(metadata: RouterOutput["note"]["metadata"]) {
	return metadata.title ?? metadata.slug;
}
