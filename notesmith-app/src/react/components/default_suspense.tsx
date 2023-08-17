import { Suspense } from "react";
import { Spinner } from "./spinner";

export default function DefaultSuspense(props: { children: React.ReactNode }) {
	return <Suspense fallback={<Spinner />}>{props.children}</Suspense>;
}
