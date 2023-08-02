import { TRPCClientError, httpBatchLink } from "@trpc/client";
import { createTRPCNext } from "@trpc/next";
import type { AppRouter } from "../server/routers/_app";
import { toast } from "react-hot-toast";
import { Router } from "next/router";
import { router } from "@/server/trpc";

function getBaseUrl() {
	if (typeof window !== "undefined")
		// browser should use relative path
		return "";

	if (process.env.VERCEL_URL)
		// reference for vercel.com
		return `https://${process.env.VERCEL_URL}`;

	if (process.env.RENDER_INTERNAL_HOSTNAME)
		// reference for render.com
		return `http://${process.env.RENDER_INTERNAL_HOSTNAME}:${process.env.PORT}`;

	if (!process.env.APP_PORT) {
		throw new Error("APP_PORT is not defined");
	}
	// assume localhost
	return `http://localhost:${process.env.APP_PORT}`;
}

export const trpc = createTRPCNext<AppRouter>({
	config(opts) {
		return {
			queryClientConfig: {
				defaultOptions: {
					queries: {
						retry: (failureCount, error) => {
							const shouldRetryAgain = failureCount < 3;

							if (error instanceof TRPCClientError) {
								// NOT_FOUND errors are handled separately; we will redirect them
								if (error.data.code !== "NOT_FOUND") {
									toast.error(error.message);
								}
								return false;
							}
							return shouldRetryAgain;
						},
					},
					mutations: {
						retry: (failureCount, error) => {
							const shouldRetryAgain = failureCount < 3;

							if (error instanceof TRPCClientError) {
								toast.error(error.message);
								return false;
							}
							return shouldRetryAgain;
						},
					},
				},
			},
			links: [
				httpBatchLink({
					/**
					 * If you want to use SSR, you need to use the server's full URL
					 * @link https://trpc.io/docs/ssr
					 **/
					url: `${getBaseUrl()}/api/trpc`,

					// You can pass any HTTP headers you wish here
					async headers() {
						return {};
					},
				}),
			],
		};
	},
	/**
	 * @link https://trpc.io/docs/ssr
	 **/
	ssr: false,
});
