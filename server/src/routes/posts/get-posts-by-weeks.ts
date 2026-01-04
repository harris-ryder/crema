import { and, gte, lt, asc, eq } from "drizzle-orm";
import { postsTable, usersTable } from "../../db/schema.ts";
import { DateTime } from "luxon";
import { db } from "../../db/index.ts";
import {
  getAnchor,
  organisePostsByWeeksAndDays,
  organizeOtherPostsByWeekAndUser,
  weekQuerySchema,
} from "./utils.ts";
import { z } from "zod";

function getWeekStart(year: number, week: number): DateTime {
  return DateTime.fromObject({
    weekYear: year,
    weekNumber: week,
    weekday: 1,
  }).setZone("Europe/London");
}

export const getPostsByWeeks = z
  .function()
  .args(weekQuerySchema.extend({ userId: z.string() }))
  .implement(async ({ count, year, week, userId }) => {
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
        userId: postsTable.user_id,
        username: usersTable.username,
        avatarUri: usersTable.avatar_uri,
      })
      .from(postsTable)
      .innerJoin(usersTable, eq(postsTable.user_id, usersTable.id))
      .where(
        and(
          gte(postsTable.local_date, startDate),
          lt(postsTable.local_date, endDate)
        )
      )
      .orderBy(asc(postsTable.local_date), asc(postsTable.created_at));

    // Handle posts that belong to the user
    const myPosts = rows.filter((post) => post.userId === userId);
    const myPostsByWeekDay = organisePostsByWeeksAndDays(
      myPosts,
      endWeekStart,
      count
    );

    // Handle all other users posts
    const otherPosts = rows.filter((post) => post.userId !== userId);
    const otherPostsByWeekAndUser = organizeOtherPostsByWeekAndUser(
      otherPosts,
      endWeekStart,
      count
    );

    return {
      count,
      myPostsByWeekDay,
      otherPostsByWeekAndUser,
      next: {
        year: startWeekStart.minus({ weeks: 1 }).weekYear,
        week: startWeekStart.minus({ weeks: 1 }).weekNumber,
      },
    };
  });
