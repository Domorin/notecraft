import { trpc } from "@/utils/trpc";
import Link from "next/link";
import { usePageSlug } from "../hooks/use_page_id";
import classNames from "classnames";

export function Sidebar() {
  const [slugs, query] = trpc.getAllSlugs.useSuspenseQuery();

  const currentSlug = usePageSlug();

  return (
    <ul className="menu">
      <li>
        <Link href="/">New Note</Link>
      </li>
      {slugs.map((val) => (
        <li className={classNames({ active: currentSlug === val.slug })}>
          <Link href={`/${val.slug}`}>{val.slug}</Link>
        </li>
      ))}
    </ul>
  );
}
