import { z } from "zod";
import { DateTime } from "luxon";

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