import { z } from "zod";
import { DateTime } from "luxon";

type Post = {
  id: string;
  imageUri: string;
  localDate: string;
  createdAt: Date;
};

export const weekQuerySchema = z.object({
  count: z.coerce.number().int().min(1).max(52).default(12),
  year: z.coerce.number().int().min(1970).max(3000).optional(),
  week: z.coerce.number().int().min(1).max(53).optional(),
});

export function getAnchor(q: z.infer<typeof weekQuerySchema>) {
  if (q.year != null && q.week != null) {
    return { year: q.year, week: q.week };
  }
  const now = DateTime.local().setZone("Europe/London");
  return { year: now.weekYear, week: now.weekNumber };
}

export function organisePostsByWeeks(
  posts: Post[],
  endWeekStart: DateTime,
  weeksCount: number
) {
  const weeks = [];
  let current = endWeekStart;
  for (let i = 0; i < weeksCount; i++) {
    const weekYear = current.weekYear;
    const weekNumber = current.weekNumber;
    const days = [];
    for (let d = 0; d < 7; d++) {
      const dateStr = current.plus({ days: d }).toISODate()!;
      const dayPosts = posts.filter((r) => r.localDate === dateStr);
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
  return weeks;
}
