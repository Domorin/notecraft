import { handleError } from "@/react/utils/error_handler";
import { useQueryClient } from "@tanstack/react-query";
import type { AppProps, AppType } from "next/app";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { trpc } from "../utils/trpc";
import "./globals.scss";

const MyApp: AppType = ({ Component, pageProps }: AppProps) => {
	const router = useRouter();
	const queryClient = useQueryClient();

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

// Stub getInitialProps so document getInitialProps is called properly
// https://github.com/vercel/next.js/issues/7791
MyApp.getInitialProps = async () => {
	return {};
};

export default trpc.withTRPC(MyApp);
