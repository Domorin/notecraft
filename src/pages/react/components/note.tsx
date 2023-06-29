import { trpc } from "@/utils/trpc";
import { Suspense, useRef, useState } from "react";
import { usePageSlug } from "../hooks/use_page_id";
import { TextInput } from "./text_input";
import { useHelpers } from "@remirror/react";

export function LoadableNote() {
  return (
    <Suspense
      fallback={<span className="loading loading-spinner text-primary"></span>}
    >
      <Note />
    </Suspense>
  );
}

export function Note() {
  const saveMutation = trpc.savePage.useMutation();
  const slug = usePageSlug();

  const [page, query] = trpc.getPage.useSuspenseQuery({
    slug,
  });

  const currentContent = useRef(page?.content ?? "");

  if (!page) {
    return <div>Page not found</div>;
  }

  return (
    <div className="flex flex-col h-full">
      <TextInput
        initial_text={page.content}
        setContent={(content) => (currentContent.current = content)}
      />
      <div className="ml-auto justify-self-end">
        <button
          onClick={() => {
            saveMutation.mutate({
              text: currentContent.current,
              slug,
            });
          }}
          className="btn btn-primary bg-black"
        >
          Save
        </button>
      </div>
    </div>
  );
}
