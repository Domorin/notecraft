import { createErrorMetadata } from "@/react/utils/error_handler";
import { ReactQueryOptions } from "@/server/trpc/routers/_app";
import { trpc } from "@/utils/trpc";
import { TRPCClientError } from "@trpc/react-query";

type Params = Pick<
	ReactQueryOptions["note"]["metadata"],
	"refetchOnMount" | "meta" | "retry"
>;

export function makeMetadataDefaultOptions(slug: string): Params {
	return {
		refetchOnMount: false,
		meta: createErrorMetadata({
			NoteMetadataNotFound: {
				slug,
			},
		}),
		retry: (failureCount, error) => {
			if (error instanceof TRPCClientError) {
				// If not found, don't retry
				if (error.data?.code === "NOT_FOUND") {
					return false;
				}
			}
			return failureCount < 3;
		},
	};
}

export function useNoteMetadataQuery(slug: string | undefined) {
	return trpc.note.metadata.useQuery(
		{
			slug: slug!,
		},
		{
			...makeMetadataDefaultOptions(slug!),
			enabled: !!slug,
		}
	);
}
