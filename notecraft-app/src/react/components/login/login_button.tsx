import { useSignoutMutation } from "@/react/hooks/trpc/use_signout_mutation";
import { useModal } from "@/react/hooks/use_modal";
import { RouterOutput } from "@/server/trpc/routers/_app";
import { trpc } from "@/utils/trpc";
import {
	faArrowRightFromBracket,
	faChevronDown,
	faGear,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRouter } from "next/router";

export function SignedInStatus(props: {
	userInfo: RouterOutput["user"]["info"];
}) {
	return props.userInfo.isLoggedIn ? (
		<LogOutButton userInfo={props.userInfo.user} />
	) : (
		<LogInButton />
	);
}

function LogOutButton(props: {
	userInfo: NonNullable<RouterOutput["user"]["info"]["user"]>;
}) {
	const modal = useModal("Settings");

	const logoutMutation = useSignoutMutation();

	return (
		<>
			<div className="dropdown dropdown-end">
				<label tabIndex={0} className="flex items-center gap-2">
					{props.userInfo.image && (
						<div className="avatar">
							<div className="w-8 overflow-hidden rounded-full">
								<img
									src={props.userInfo?.image}
									referrerPolicy="no-referrer"
								/>
							</div>
						</div>
					)}
					<div>{props.userInfo.name}</div>
					<FontAwesomeIcon icon={faChevronDown} />
				</label>
				<ul
					tabIndex={0}
					className="dropdown-content menu rounded-box bg-base-100 z-[10] max-h-80 flex-nowrap overflow-scroll p-2 shadow"
				>
					<li className="mr-auto">
						<button
							className="btn btn-ghost btn-sm"
							onClick={() => {
								modal.openModal({});
							}}
						>
							<FontAwesomeIcon icon={faGear} /> Settings
						</button>
					</li>
					<li className="mr-auto">
						<button
							className="btn btn-ghost btn-sm"
							onClick={() => {
								logoutMutation.mutate();
							}}
						>
							<FontAwesomeIcon icon={faArrowRightFromBracket} />{" "}
							Log out
						</button>
					</li>
				</ul>
			</div>
		</>
	);

	// <div className="dropdown-end dropdown">
	// 		<label
	// 			title={"Theme"}
	// 			tabIndex={0}
	// 			className="btn-ghost rounded-btn btn"
	// 		>
	// 			<FontAwesomeIcon className="" icon={faPalette} />
	// 		</label>
	// 		<ul
	// 			tabIndex={0}
	// 			className="dropdown-content menu rounded-box bg-base-100 z-[10] max-h-80 w-52 flex-nowrap overflow-scroll p-2 shadow"
	// 		>
	// 			{themes.map((theme) => (
	// 				<li key={theme} onClick={() => updateTheme(theme)}>
	// 					<a
	// 						className={classNames({
	// 							active: theme === selectedTheme,
	// 						})}
	// 					>
	// 						{theme}
	// 					</a>
	// 				</li>
	// 			))}
	// 		</ul>
	// 	</div>
}

function LogInButton() {
	const modal = useModal("Login");

	return (
		<button className="btn btn-ghost" onClick={() => modal.openModal({})}>
			Login
		</button>
	);
}
