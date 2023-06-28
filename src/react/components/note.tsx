import { router } from "@/server/trpc";
import { trpc } from "@/utils/trpc";
import { useRouter } from "next/router";
import { Suspense, useState } from "react";
import { usePageSlug } from "../hooks/use_page_id";
// import { Remirror, useRemirror } from "@remirror/react";
// import {
//   BoldExtension,
//   CalloutExtension,
//   ItalicExtension,
// } from "remirror/extensions";

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

  const [text, setText] = useState(page?.content ?? "");

  // const { manager, state } = useRemirror({
  //   extensions: () => [
  //     new BoldExtension(),
  //     new ItalicExtension(),
  //     new CalloutExtension({ defaultType: "warn" }),
  //   ],

  //   // Set the initial content.
  //   content: text,

  //   // Place the cursor at the start of the document. This can also be set to
  //   // `end`, `all` or a numbered position.
  //   selection: "start",

  //   // Set the string handler which means the content provided will be
  //   // automatically handled as html.
  //   // `markdown` is also available when the `MarkdownExtension`
  //   // is added to the editor.
  //   stringHandler: "html",
  // });
  return (
    <div className="flex flex-col h-full">
      {/* <Remirror
        manager={manager}
        initialContent={state}
        classNames={[
          "prose prose-h1:text-4xl dark:prose-invert prose-p:my-0 prose-sm sm:prose-base lg:prose-lg xl:prose-md m-2 focus:outline-none mx-20 mb-8",
        ]}
      /> */}
      <div
        contentEditable
        className="focus:outline-none w-full h-full"
        onInput={(e) => setText(e.currentTarget.textContent ?? "")}
      >
        {text}
      </div>
      <div className="ml-auto justify-self-end">
        <button
          onClick={() =>
            saveMutation.mutate({
              text,
              slug,
            })
          }
          className="btn btn-primary bg-black"
        >
          Save
        </button>
      </div>
    </div>
  );
}
