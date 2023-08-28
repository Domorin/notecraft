import { TRPCClientError, httpBatchLink } from "@trpc/client";
import { createTRPCNext } from "@trpc/next";
import SuperJSON from "superjson";
import type { AppRouter } from "../server/routers/_app";

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

	if (process.env.NEXT_PUBLIC_WEB_APP_URL === "localhost")
		return process.env.NEXT_PUBLIC_WEB_APP_URL === "localhost"
			? "http://localhost:3000"
			: `https://${process.env.NEXT_PUBLIC_WEB_APP_URL}`;

	// assume localhost
	// return `https://${process.env.NEXT_PUBLIC_WEB_APP_URL}`;
	// return `${process.env.NEXT_PUBLIC_WEB_APP_PROTOCOL}://${process.env.NEXT_PUBLIC_WEB_APP_URL}`;
}

export const trpc = createTRPCNext<AppRouter>({
	config(opts) {
		const { ctx } = opts;
		if (typeof window !== "undefined") {
			// during client requests
			return {
				transformer: SuperJSON, // optional - adds superjson serialization
				links: [
					httpBatchLink({
						url: "/api/trpc",
					}),
				],
			};
		}

		return {
			transformer: SuperJSON,
			queryClientConfig: {
				defaultOptions: {
					queries: {
						retry: (failureCount, error) => {
							if (error instanceof TRPCClientError) {
								// If not found, don't retry
								if (error.data?.code === "NOT_FOUND") {
									return false;
								}
							}
							return failureCount < 3;
						},
					},
					mutations: {
						retry: (failureCount, error) => {
							if (error instanceof TRPCClientError) {
								// If not found, don't retry
								if (error.data?.code === "NOT_FOUND") {
									return false;
								}
							}
							return failureCount < 3;
						},
					},
				},
			},
			links: [
				httpBatchLink({
					// The server needs to know your app's full url
					url: `${getBaseUrl()}/api/trpc`,
					/**
					 * Set custom request headers on every request from tRPC
					 * @link https://trpc.io/docs/v10/header
					 */
					headers() {
						if (!ctx?.req?.headers) {
							return {};
						}
						// To use SSR properly, you need to forward client headers to the server
						// This is so you can pass through things like cookies when we're server-side rendering
						return {
							cookie: ctx.req.headers.cookie,
						};
					},
				}),
			],
		};
	},
	ssr: true,
});
