import { Suspense } from "react";
import { Spinner } from "./spinner";

export function DefaultSuspense(props: { children: React.ReactNode }) {
	return <Suspense fallback={<Spinner />}>{props.children}</Suspense>;
}
