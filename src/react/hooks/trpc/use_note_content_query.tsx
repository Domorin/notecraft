import { RouterOutput } from "@/server/routers/_app";
import { CustomError } from "@/server/routers/note";
import { trpc } from "@/utils/trpc";
import { useRouter } from "next/router";
import { useEffect } from "react";

function IsError(
	data: RouterOutput["note"]["content"] | undefined
): data is CustomError {
	return !!data && "code" in data;
}

/**
 * Wrapper to get proper types on custom error object.
 * Bit messy, but TRPC errors with SSR was already wonky
 */
export function useNoteContentQuery(slug: string | undefined) {
	const router = useRouter();

	const contentQuery = trpc.note.content.useQuery(
		{ slug: slug! },
		{
			enabled: !!slug,
		}
	);

	const isError = IsError(contentQuery.data);

	useEffect(() => {
		if (isError) {
			router.push("/not-found", undefined, { shallow: true });
		}
	}, [isError, router]);

	if (!contentQuery.isSuccess) {
		return {
			...contentQuery,
			isSuccess: false as const,
			data: undefined,
		};
	}

	return IsError(contentQuery.data)
		? {
				...contentQuery,
				isSuccess: false as const,
				data: undefined,
		  }
		: {
				...contentQuery,
				data: contentQuery.data,
		  };
}
