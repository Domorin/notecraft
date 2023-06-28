import type { AppType } from "next/app";
import { trpc } from "../utils/trpc";
import "./globals.css";
import { useRouter } from "next/router";

const MyApp: AppType = ({ Component, pageProps }) => {
  const router = useRouter();

  if (!router.isReady) {
    return <></>;
  }

  return <Component {...pageProps} />;
};
export default trpc.withTRPC(MyApp);
