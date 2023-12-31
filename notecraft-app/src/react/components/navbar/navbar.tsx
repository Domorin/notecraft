import { useSession } from "@/react/hooks/use_session";
import { SignedInStatus } from "../login/login_button";
import ThemePicker from "../theme_picker";
import Image from "next/image";
import { useRouter } from "next/router";
import notecraftLogo from "../../../../public/icon.png";

export function Navbar() {
	const session = useSession();
	const router = useRouter();

	return (
		<div className="min-h-12 flex h-12 w-full items-center">
			<div
				className="mx-2 flex cursor-pointer gap-1 text-xl font-bold"
				onClick={() => router.push("/", undefined, { shallow: true })}
			>
				<Image
					src={notecraftLogo}
					width={32}
					height={32}
					alt="NoteCraft Logo"
				/>
				<div className="hidden sm:block">NoteCraft</div>
			</div>
			<div className="mx-2 ml-auto flex items-center gap-2">
				{!session && <ThemePicker />}
				<SignedInStatus session={session} />
			</div>
		</div>
	);
}
