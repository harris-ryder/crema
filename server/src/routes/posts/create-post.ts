import { z } from "zod";
import { usersTable, postsTable } from "../../db/schema.ts";
import { selectUserSchema } from "../../db/schema.types.ts";
import { insertPostSchema, selectPostSchema } from "../../db/schema.types.ts";
import { db } from "../../db/index.ts";

export const createPost = z
  .function()
  .args(
    z.object({
      post: insertPostSchema.omit({ user_id: true }),
      user: selectUserSchema.pick({ id: true }),
    })
  )
  .returns(z.promise(selectPostSchema))
  .implement(async ({ post, user }) => {
    return await db.transaction(async (tx) => {
      const [newPost] = await tx
        .insert(postsTable)
        .values({ ...post, user_id: user.id })
        .onConflictDoUpdate({
          target: postsTable.id,
          set: post,
        })
        .returning();
      return newPost;
    });
  });
