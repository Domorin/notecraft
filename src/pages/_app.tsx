import type { AppType } from "next/app";
import { trpc } from "../utils/trpc";
import "./globals.scss";
import { useQueryClient } from "@tanstack/react-query";
import { TRPCClientError } from "@trpc/client";
import { useRouter } from "next/router";
import { useEffect } from "react";
import toast from "react-hot-toast";

const MyApp: AppType = ({ Component, pageProps }) => {
	const router = useRouter();
	const queryClient = useQueryClient();
	useEffect(() => {
		// These should be set when the queryClient is created but couldn't figure out how to do it with TRPC's NextJs business
		console.log("setting calbacks");
		queryClient.getQueryCache().config.onError = (error) => {
			if (error instanceof TRPCClientError) {
				if (error.data.code === "NOT_FOUND") {
					router.push("/not-found");
				}
				toast.error(error.message);
			}
		};
		queryClient.getMutationCache().config.onError = (error) => {
			if (error instanceof TRPCClientError) {
				if (error.data.code !== "NOT_FOUND") {
					toast.error(error.message);
				}
			}
		};
	}, []);

	return <Component {...pageProps} />;
};
export default trpc.withTRPC(MyApp);
