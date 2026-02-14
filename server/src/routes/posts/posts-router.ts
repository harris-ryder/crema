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
import { getPostsByWeeks } from "./get-posts-by-weeks.ts";
import { getUserPostsByWeeks } from "./get-user-posts-by-weeks.ts";
import { weekQuerySchema, getAnchor } from "./utils.ts";

export const postsRouter = new Hono()
  .basePath("/posts")
  .get("/", async (c) => {
    const posts = await db
      .select({
        id: postsTable.id,
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
  .post(
    "/",
    authRequiredMiddleware,
    zValidator(
      "form",
      z.object({
        file: uploadImageParams.shape.file,
        postDate: z
          .string()
          .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
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

      const imageUri = await uploadImage({
        file: body["file"],
      });

      const postDate = body["postDate"] as string;

      // Validate date is not too old and not in the future
      // Note: postDate is YYYY-MM-DD which JS interprets as UTC midnight
      const selectedDate = new Date(postDate + "T00:00:00Z");
      const oldestDate = new Date("2020-01-01T00:00:00Z");

      // For future check, we need to consider timezones
      // Someone in UTC+14 (Kiribati) could be almost a full day ahead
      // So we allow dates up to tomorrow UTC to account for all timezones
      const tomorrow = new Date();
      tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
      tomorrow.setUTCHours(23, 59, 59, 999);

      if (selectedDate < oldestDate) {
        return c.json(
          { success: false, error: "Date cannot be before January 1, 2020" },
          400
        );
      }

      if (selectedDate > tomorrow) {
        return c.json(
          { success: false, error: "Date cannot be in the future" },
          400
        );
      }

      const post = await createPost({
        post: {
          image_uri: imageUri,
          local_date: postDate,
        },
        user: user,
      });

      return c.json({ success: true, post }, 201);
    }
  )
  .get("/weeks", zValidator("query", weekQuerySchema), async (c) => {
    const user = c.get("user");
    if (!user) {
      return c.text("missing user", 401);
    }

    const q = c.req.valid("query");
    const anchor = getAnchor(q);

    const data = await getPostsByWeeks({
      count: q.count,
      year: anchor.year,
      week: anchor.week,
      userId: user.id,
    });

    return c.json(data);
  })
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
  )
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
  );
