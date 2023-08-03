import type {
	MutationMeta,
	Query,
	QueryKey,
	QueryMeta,
} from "@tanstack/react-query";
import { TRPCClientError } from "@trpc/client";
import type { TRPC_ERROR_CODE_KEY } from "@trpc/server/rpc";
import { NextRouter } from "next/router";
import toast from "react-hot-toast";

export type CustomMetadata = {
	type: "ContentLoadFailed";
	errorMessage: string;
	slug: string;
	trigger: TRPC_ERROR_CODE_KEY[];
	redirectUrl?: string;
	toastMessage?: string;
};

export function createErrorMetadata(type: CustomMetadata) {
	return type;
}

export function isCustomMetadata(type: unknown): type is CustomMetadata {
	return "trigger" in (type as CustomMetadata);
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

		if (!meta.trigger.includes(error.data.code)) {
			return;
		}

		if (meta.redirectUrl) {
			router.push(meta.redirectUrl);
		}

		if (meta.toastMessage) {
			toast(meta.toastMessage);
		}
	}
}
