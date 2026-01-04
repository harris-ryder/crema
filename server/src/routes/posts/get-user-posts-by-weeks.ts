import { and, gte, lt, asc, eq } from "drizzle-orm";
import { postsTable } from "../../db/schema.ts";
import { DateTime } from "luxon";
import { db } from "../../db/index.ts";
import { getAnchor, organisePostsByWeeks, weekQuerySchema } from "./utils.ts";
import { z } from "zod";

function getWeekStart(year: number, week: number): DateTime {
  return DateTime.fromObject({
    weekYear: year,
    weekNumber: week,
    weekday: 1,
  }).setZone("Europe/London");
}

export const getUserPostsByWeeks = z
  .function()
  .args(weekQuerySchema.extend({ userId: z.string() }))
  .implement(async ({ userId, count, year, week }) => {
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
        localDate: postsTable.local_date,
        createdAt: postsTable.created_at,
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

    const weeks = organisePostsByWeeks(rows, endWeekStart, count);

    return {
      count,
      weeks,
      next: {
        year: startWeekStart.minus({ weeks: 1 }).weekYear,
        week: startWeekStart.minus({ weeks: 1 }).weekNumber,
      },
    };
  });
