import MainPage from "@/react/components/main";
import { trpc } from "@/utils/trpc";
import { useRouter } from "next/router";
import { useEffect } from "react";

export default function IndexPage() {
  const router = useRouter();

  const mutation = trpc.createPage.useMutation({
    onSuccess: (data) => {
      router.push(`/${data}`);
    },
  });

  useEffect(() => {
    mutation.mutate();
  }, []);

  return <span className="loading loading-spinner text-primary"></span>;
}
