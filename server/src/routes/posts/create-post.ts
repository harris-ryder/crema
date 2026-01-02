import { z } from "zod";
import { DateTime } from "luxon";
import { postsTable } from "../../db/schema.ts";
import { selectUserSchema } from "../../db/schema.types.ts";
import { insertPostSchema, selectPostSchema } from "../../db/schema.types.ts";
import { db } from "../../db/index.ts";

export const createPost = z
  .function()
  .args(
    z.object({
      post: insertPostSchema.omit({
        user_id: true,
        created_at: true,
        updated_at: true,
        id: true,
      }),
      user: selectUserSchema.pick({ id: true }),
    })
  )
  .returns(z.promise(selectPostSchema))
  .implement(async ({ post, user }) => {
    const { local_date: localDate, ...postData } = post;

    return await db.transaction(async (tx) => {
      const [newPost] = await tx
        .insert(postsTable)
        .values({
          ...postData,
          user_id: user.id,
          local_date: localDate,
        })
        .returning();

      return newPost;
    });
  });
