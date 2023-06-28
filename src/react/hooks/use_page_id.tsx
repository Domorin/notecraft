import { useRouter } from "next/router";

export function usePageSlug() {
  const router = useRouter();

  return router.query.slug as string;
}
