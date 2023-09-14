import * as cookie from "cookie";
import { GetServerSidePropsContext, GetServerSidePropsResult } from "next";
import { withSessionSsr } from "./session";



async function getDefaultProps(context: GetServerSidePropsContext) {
	const sidebarOpened =
		cookie.parse(context.req.headers.cookie || "")["sidebarOpen"] ===
			"false"
			? false
			: true;

	return {
		sidebarOpened,
		user: context.req.session?.user ?? null,
	};
}



export const defaultGetServerSideProps = <T extends Record<string, unknown>>(propsGetter?: (context: GetServerSidePropsContext) => Promise<T>) => withSessionSsr(async (context) => {
	const promises: Array<Promise<Record<string, unknown>>> = [getDefaultProps(context)];
	if (propsGetter) promises.push(propsGetter(context));

	const propGroups = await Promise.all(promises);


	return {
		props: propGroups.reduce((acc, val) => ({ ...acc, ...val }), {})
	} as GetServerSidePropsResult<T & Awaited<ReturnType<typeof getDefaultProps>>>;
})




