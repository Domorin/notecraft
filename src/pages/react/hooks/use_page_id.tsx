import { useRouter } from "next/router";

export function usePageSlug() {
  const router = useRouter();

  if (!router.isReady) {
    return undefined;
  }

  return router.query.slug as string;
}
