import { useQueryClient } from "@tanstack/react-query";
import type { AppType } from "next/app";
import { useRouter } from "next/router";
import { useEffect, useRef } from "react";
import { trpc } from "../utils/trpc";
import "./globals.scss";
import { usePageSlug } from "@/react/hooks/use_page_id";
import { handleError } from "@/react/utils/error_handler";

const MyApp: AppType = ({ Component, pageProps }) => {
	const router = useRouter();
	const queryClient = useQueryClient();
	const slug = usePageSlug();
	const ref = useRef(slug);

	ref.current = slug;

	useEffect(() => {
		// These should be set when the queryClient is created but couldn't figure out how to do it with TRPC's NextJs business
		queryClient.getQueryCache().config.onError = (error, query) => {
			handleError(router, error, query.meta);
		};
		queryClient.getMutationCache().config.onError = (
			error,
			_variables,
			_context,
			mutation
		) => {
			handleError(router, error, mutation.meta);
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return <Component {...pageProps} />;
};
export default trpc.withTRPC(MyApp);
