import { and, gte, lt, asc, eq } from "drizzle-orm";
import { postsTable } from "../../db/schema.ts";
import { DateTime } from "luxon";
import { db } from "../../db/index.ts";
import { getAnchor, weekQuerySchema } from "./utils.ts";
import { z } from "zod";

function getWeekStart(year: number, week: number): DateTime {
  return DateTime.fromObject({
    weekYear: year,
    weekNumber: week,
    weekday: 1,
  }).setZone("utc");
}

export const getUserPostsByWeeks = z
  .function()
  .args(weekQuerySchema.extend({ userId: z.string() }))
  .implement(async ({
    userId,
    count,
    year,
    week,
  }) => {
  const anchor = getAnchor({ count, year, week });
  const anchorDateTime = getWeekStart(anchor.year, anchor.week);

  const endWeekStart = anchorDateTime;
  const startWeekStart = endWeekStart.minus({ weeks: count - 1 });
  const startDate = startWeekStart.toISODate()!;
  const endDate = endWeekStart.plus({ days: 7 }).toISODate()!;

  const rows = await db
    .select({
      id: postsTable.id,
      imageUri: postsTable.image_uri,
      description: postsTable.description,
      localDate: postsTable.local_date,
      createdAt: postsTable.created_at,
      postTz: postsTable.post_tz,
    })
    .from(postsTable)
    .where(
      and(
        eq(postsTable.user_id, userId),
        gte(postsTable.local_date, startDate),
        lt(postsTable.local_date, endDate)
      )
    )
    .orderBy(asc(postsTable.local_date), asc(postsTable.created_at));

  const weeks = [];
  let current = endWeekStart;
  for (let i = 0; i < count; i++) {
    const weekYear = current.weekYear;
    const weekNumber = current.weekNumber;
    const days = [];
    for (let d = 0; d < 7; d++) {
      const dateStr = current.plus({ days: d }).toISODate()!;
      const dayPosts = rows.filter((r) => r.localDate === dateStr);
      days.push({
        localDate: dateStr,
        posts: dayPosts,
      });
    }
    weeks.push({
      weekYear,
      weekNumber,
      weekStartLocalDate: current.toISODate()!,
      days,
    });
    current = current.minus({ weeks: 1 });
  }

  return {
    count,
    weeks,
    next: { year: current.weekYear, week: current.weekNumber },
  };
});
