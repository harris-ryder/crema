import { z } from "zod";
import { DateTime, IANAZone } from "luxon";
import { postsTable } from "../../db/schema.ts";
import { selectUserSchema } from "../../db/schema.types.ts";
import { insertPostSchema, selectPostSchema } from "../../db/schema.types.ts";
import { db } from "../../db/index.ts";

function normalizeTz(input: string): string {
  if (typeof input !== "string" || input.length > 64) return "UTC";
  return IANAZone.isValidZone(input) ? input : "UTC";
}

export const createPost = z
  .function()
  .args(
    z.object({
      post: insertPostSchema.omit({
        user_id: true,
        local_date: true,
        created_at: true,
        updated_at: true,
        id: true,
      }),
      user: selectUserSchema.pick({ id: true }),
    })
  )
  .returns(z.promise(selectPostSchema))
  .implement(async ({ post, user }) => {
    const { post_tz: postTz, ...postData } = post;

    const normalizedPostTz = normalizeTz(postTz);

    const nowUtc = DateTime.utc();
    const createdAt = nowUtc.toJSDate();
    const localDate = nowUtc.setZone(normalizedPostTz).toISODate()!;

    return await db.transaction(async (tx) => {
      const [newPost] = await tx
        .insert(postsTable)
        .values({
          ...postData,
          user_id: user.id,
          post_tz: normalizedPostTz,
          local_date: localDate,
          created_at: createdAt,
          updated_at: createdAt,
        })
        .returning();

      return newPost;
    });
  });
