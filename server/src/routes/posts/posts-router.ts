import { Hono } from "hono";
import { authRequiredMiddleware } from "../../middlewares/auth-required-middleware.ts";
import { db } from "../../db/index.ts";
import { postsTable } from "../../db/schema.ts";
import { desc } from "drizzle-orm";
import { selectPostSchema } from "../../db/schema.types.ts";
import z from "zod";
import { zValidator } from "@hono/zod-validator";
import { eq } from "drizzle-orm";

export const postsRouter = new Hono();

const route = postsRouter
  .basePath("/posts")
  .get("/", async (c) => {
    const posts = await db
      .select()
      .from(postsTable)
      .orderBy(desc(postsTable.created_at))
      .limit(50);
    return c.json({ success: true, posts });
  })
  .get(
    "/:postId",
    zValidator("param", z.object({ postId: selectPostSchema.shape.id })),
    async (c) => {
      const postId = c.req.valid("param").postId;

      const post = await db
        .select()
        .from(postsTable)
        .where(eq(postsTable.id, postId));

      if (!post) {
        return c.json<{ success: false; error: string }>(
          {
            success: false,
            error: "post not found",
          },
          404
        );
      }

      return c.json<{ success: true; data: { post: typeof post } }>(
        { success: true, data: { post } },
        201
      );
    }
  );

export type PostsRoute = typeof route;
