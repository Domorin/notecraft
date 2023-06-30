import { buildStaticPaths } from "next/dist/build/utils";
import { wordList } from "./list";
import { v4 as uuidv4, parse as uuidParse } from "uuid";
import { Prisma } from "@prisma/client";
import { prisma } from "../prisma";

// https://github.com/glitchdotcom/friendly-words/blob/main/words/predicates.txt
export namespace Words {
  const objectChoices = wordList.objects.length;
  const predicateChoices = wordList.predicates.length;
  const teamChoices = wordList.teams.length;

  function getPageSlug(predicates = 1) {
    const slugs: string[] = [];

    for (let i = 0; i < predicates; i++) {
      slugs.push(
        wordList.predicates[Math.floor(Math.random() * predicateChoices)]
      );
    }

    slugs.push(wordList.objects[Math.floor(Math.random() * objectChoices)]);
    slugs.push(wordList.teams[Math.floor(Math.random() * teamChoices)]);

    return slugs.join("-");
  }

  export async function getUniquePageSlug() {
    let existing_slug: Prisma.NoteGetPayload<{}> | null = null;
    let i = 0;
    do {
      i++;
      const slug = getPageSlug(i);
      existing_slug = await prisma.note.findFirst({
        where: {
          slug,
        },
      });

      if (!existing_slug) {
        return slug;
      }
    } while (existing_slug);

    throw new Error("Could not find unique slug");
  }
}
