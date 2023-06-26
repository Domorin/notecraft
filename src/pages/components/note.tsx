import { trpc } from "@/utils/trpc";

export function Note() {
  const ping_query = trpc.hello.useQuery({
    text: "pong",
  });

  return (
    <div contentEditable className="focus:outline-none w-full h-full">
      hello :) ping: {ping_query.data?.greeting}
    </div>
  );
}
