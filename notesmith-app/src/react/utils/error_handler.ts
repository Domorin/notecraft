import type { MutationMeta, QueryMeta } from "@tanstack/react-query";
import { TRPCClientError } from "@trpc/client";
import type { TRPC_ERROR_CODE_KEY } from "@trpc/server/rpc";
import { NextRouter } from "next/router";
import { removeFromLocalStorage } from "../hooks/use_recents";

type CustomMetadata = {
	_custom_metadata: true;
	NoteMetadataNotFound: {
		slug: string;
	};
};

type CustomMetadataInput = Omit<CustomMetadata, "_custom_metadata">;

const MetadataErrorTriggers: Record<
	keyof CustomMetadataInput,
	TRPC_ERROR_CODE_KEY[]
> = {
	NoteMetadataNotFound: ["NOT_FOUND"],
};

export function createErrorMetadata(type: CustomMetadataInput): CustomMetadata {
	return { ...type, _custom_metadata: true };
}

export function isCustomMetadata(type: unknown): type is CustomMetadata {
	if (!type) return false;

	return "_custom_metadata" in (type as CustomMetadata);
}

function typedKeys<T extends object>(obj: T) {
	return Object.keys(obj) as (keyof T)[];
}

export function handleError(
	router: NextRouter,
	error: unknown,
	meta: QueryMeta | MutationMeta | undefined
) {
	if (error instanceof TRPCClientError) {
		if (!isCustomMetadata(meta)) {
			return;
		}

		for (const key of typedKeys(meta)) {
			if (key === "_custom_metadata") {
				continue;
			}

			// If it is not an error code that triggers this, then ignore
			if (!MetadataErrorTriggers[key].includes(error.data.code)) {
				continue;
			}

			switch (key) {
				case "NoteMetadataNotFound": {
					removeFromLocalStorage(meta[key].slug);
					break;
				}
			}
		}
	}
}
