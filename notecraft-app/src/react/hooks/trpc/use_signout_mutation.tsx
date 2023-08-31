import { trpc } from "@/utils/trpc";
import { useRouter } from "next/router";

export function useSignoutMutation() {
	const router = useRouter();
	return trpc.user.logout.useMutation({
		onSuccess: () => {
			router.reload();
		},
	});
}
