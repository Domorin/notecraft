import { Suspense } from "react";
import { LoadableNote } from "./note";
import { Sidebar } from "./sidebar";
import { Spinner } from "./spinner";

export default function MainPage() {
	return (
		<div className="flex h-screen items-center justify-center bg-base-300">
			<div className="rounded-box flex h-3/4 w-3/4 overflow-hidden">
				<div className="w-1/6 bg-base-200">
					<Suspense fallback={<Spinner />}>
						<Sidebar />
					</Suspense>
				</div>
				<div className="flex-grow bg-base-100 p-8">
					<LoadableNote />
				</div>
			</div>
		</div>
	);
}
