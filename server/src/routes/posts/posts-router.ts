import { Hono } from "hono";
import { authRequiredMiddleware } from "../../middlewares/auth-required-middleware.ts";
import { db } from "../../db/index.ts";
import { postsTable, postReactionsTable, usersTable } from "../../db/schema.ts";
import { desc, and } from "drizzle-orm";
import {
  insertPostReactionSchema,
  selectPostSchema,
} from "../../db/schema.types.ts";
import z from "zod";
import { zValidator } from "@hono/zod-validator";
import { eq } from "drizzle-orm";
import { createPost } from "./create-post.ts";
import { uploadImage, uploadImageParams } from "../../helpers/upload-image.ts";
import { DateTime } from "luxon";
import { getPostsByWeeks } from "./get-posts-by-weeks.ts";
import { getUserPostsByWeeks } from "./get-user-posts-by-weeks.ts";

export const postsRouter = new Hono();

const weekQuerySchema = z.object({
  count: z.coerce.number().int().min(1).max(52).default(12),
  year: z.coerce.number().int().min(1970).max(3000).optional(),
  week: z.coerce.number().int().min(1).max(53).optional(),
});

function getAnchor(q: z.infer<typeof weekQuerySchema>) {
  if (q.year != null && q.week != null) {
    return { year: q.year, week: q.week };
  }
  const now = DateTime.local().setZone("Europe/London");
  return { year: now.weekYear, week: now.weekNumber };
}

const route = postsRouter
  .basePath("/posts")
  .get("/", async (c) => {
    const posts = await db
      .select({
        id: postsTable.id,
        description: postsTable.description,
        image_uri: postsTable.image_uri,
        created_at: postsTable.created_at,
        updated_at: postsTable.updated_at,
        user: {
          id: usersTable.id,
          username: usersTable.username,
        },
      })
      .from(postsTable)
      .innerJoin(usersTable, eq(postsTable.user_id, usersTable.id))
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
  )
  .post(
    "/",
    authRequiredMiddleware,
    zValidator(
      "form",
      z.object({
        file: uploadImageParams.shape.file,
        description: z.string().optional(),
        postTz: z.string(),
      })
    ),
    async (c) => {
      const body = await c.req.parseBody();
      if (!(body["file"] instanceof File)) {
        return c.text("Invalid file", 500);
      }

      const user = c.get("user");
      if (!user) {
        return c.text("missing user", 401);
      }

      if (
        body["description"] != null &&
        typeof body["description"] !== "string"
      ) {
        return c.text("Invalid description", 500);
      }

      const imageUri = await uploadImage({
        file: body["file"],
      });

      const description = body["description"] as string | undefined;
      const postTz = body["postTz"] as string;

      const post = await createPost({
        post: {
          image_uri: imageUri,
          description: description ?? null,
          post_tz: postTz,
        },
        user: user,
      });

      return c.json({ success: true, post }, 201);
    }
  )
  .put(
    "/:postId/reaction",
    authRequiredMiddleware,
    zValidator("param", z.object({ postId: selectPostSchema.shape.id })),
    zValidator(
      "json",
      z.object({ emoji: insertPostReactionSchema.shape.emoji })
    ),
    async (c) => {
      const postId = c.req.valid("param").postId;
      const { emoji } = c.req.valid("json");
      const user = c.get("user");
      if (!user) {
        return c.text("missing user", 401);
      }

      const [reaction] = await db
        .insert(postReactionsTable)
        .values({
          post_id: postId,
          user_id: user.id,
          emoji: emoji,
        })
        .onConflictDoUpdate({
          target: [postReactionsTable.post_id, postReactionsTable.user_id],
          set: {
            emoji: emoji,
            updated_at: new Date(),
          },
        })
        .returning();

      return c.json({ success: true, reaction }, 200);
    }
  )
  .delete(
    "/:postId/reaction",
    authRequiredMiddleware,
    zValidator("param", z.object({ postId: selectPostSchema.shape.id })),
    async (c) => {
      const postId = c.req.valid("param").postId;
      const user = c.get("user");
      if (!user) {
        return c.text("missing user", 401);
      }

      const deleted = await db
        .delete(postReactionsTable)
        .where(
          and(
            eq(postReactionsTable.post_id, postId),
            eq(postReactionsTable.user_id, user.id)
          )
        )
        .returning();

      if (deleted.length === 0) {
        return c.json(
          { success: false, message: "No reaction to delete" },
          404
        );
      }

      return c.json({ success: true }, 200);
    }
  )
  .get(
    "/weeks",
    zValidator("query", weekQuerySchema),
    async (c) => {
      const q = c.req.valid("query");
      const anchor = getAnchor(q);

      const data = await getPostsByWeeks({
        count: q.count,
        year: anchor.year,
        week: anchor.week,
      });

      return c.json(data);
    }
  )
  .get(
    "/:userId/weeks",
    zValidator("param", z.object({ userId: z.string().uuid() })),
    zValidator("query", weekQuerySchema),
    async (c) => {
      const { userId } = c.req.valid("param");
      const q = c.req.valid("query");
      const anchor = getAnchor(q);

      const data = await getUserPostsByWeeks({
        userId,
        count: q.count,
        year: anchor.year,
        week: anchor.week,
      });

      return c.json(data);
    }
  );

export type PostsRoute = typeof route;
