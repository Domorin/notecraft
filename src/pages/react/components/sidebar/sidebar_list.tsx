import { DateTime } from "luxon";
import { SidebarTimeSection } from "./sidebar_time_section";

export function SidebarList(props: {
	slugs: { slug: string; date: DateTime }[];
}) {
	const now = DateTime.now();
	const yesterday = now
		.minus({ days: 1 })
		.set({ hour: 0, minute: 0, second: 0, millisecond: 0 });
	const sevenDaysAgo = now
		.minus({ days: 7 })
		.set({ hour: 0, minute: 0, second: 0, millisecond: 0 });
	const thirtyDaysAgo = now
		.minus({ days: 30 })
		.set({ hour: 0, minute: 0, second: 0, millisecond: 0 });

	const todaysSlugs: string[] = [];
	const yesterdaysSlugs: string[] = [];
	const lastSevenDaysSlugs: string[] = [];
	const lastThirtyDaysSlugs: string[] = [];
	const remainingSlugs: string[] = [];

	props.slugs.forEach((val) => {
		if (now.hasSame(val.date, "day")) {
			todaysSlugs.push(val.slug);
		} else if (yesterday.hasSame(val.date, "day")) {
			yesterdaysSlugs.push(val.slug);
		} else if (val.date > sevenDaysAgo) {
			lastSevenDaysSlugs.push(val.slug);
		} else if (val.date > thirtyDaysAgo) {
			lastThirtyDaysSlugs.push(val.slug);
		} else {
			remainingSlugs.push(val.slug);
		}
	});

	// const todaySlugs = props.slugs.filter((val) =>
	// 	val.date.hasSame(now, "day")
	// );
	// const yesterdaysSlugs = props.slugs.filter((val) =>
	// 	val.date.hasSame(now.minus({ days: 1 }), "day")
	// );
	// const thisWeekSlugs = props.slugs.filter(
	// 	(val) => val.date > now.minus({ days: 7 })
	// );
	return (
		<ul className="w-full p-0">
			{todaysSlugs.length > 0 && (
				<>
					<SidebarTimeSection title="Today" slugs={todaysSlugs} />
					<SidebarTimeSection
						title="Yesterday"
						slugs={yesterdaysSlugs}
					/>
					<SidebarTimeSection
						title="Previous 7 Days"
						slugs={lastSevenDaysSlugs}
					/>
					<SidebarTimeSection
						title="Previous 30 Days"
						slugs={lastThirtyDaysSlugs}
					/>
					<SidebarTimeSection title="Past" slugs={remainingSlugs} />
				</>
			)}
		</ul>
	);
}
