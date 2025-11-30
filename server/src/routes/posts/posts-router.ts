import { Hono } from "hono";
import { authRequiredMiddleware } from "../../middlewares/auth-required-middleware.ts";
import { db } from "../../db/index.ts";
import { postsTable, postReactionsTable } from "../../db/schema.ts";
import { desc, and } from "drizzle-orm";
import {
  insertPostReactionSchema,
  selectPostSchema,
} from "../../db/schema.types.ts";
import z from "zod";
import { zValidator } from "@hono/zod-validator";
import { eq } from "drizzle-orm";
import { createPost } from "./create-post.ts";
import {
  uploadImage,
  uploadImageParams,
} from "../../helpers.ts/upload-image.ts";

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
  )
  .post(
    "/",
    authRequiredMiddleware,
    zValidator(
      "form",
      z.object({
        file: uploadImageParams.shape.file,
        description: z.string().optional(),
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
      const post = await createPost({
        post: {
          image_uri: imageUri,
          description: description ?? null,
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
  );

export type PostsRoute = typeof route;
