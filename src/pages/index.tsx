import { trpc } from "@/utils/trpc";
import { useRouter } from "next/router";
import { useEffect } from "react";

export default function IndexPage() {
  const router = useRouter();

  const context = trpc.useContext();

  const mutation = trpc.createPage.useMutation({
    onSuccess: (data) => {
      context.getAllSlugs.setData(undefined, (slugs) => {
        if (!slugs) {
          return slugs;
        }

        return [{ slug: data }, ...slugs];
      });
      router.push(`/${data}`);
    },
  });

  useEffect(() => {
    mutation.mutate();
  }, []);

  return (
    <div className="flex h-full w-full items-center">
      <div className="loading loading-spinner mx-auto text-primary"></div>;
    </div>
  );
}
