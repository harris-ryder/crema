import { zValidator } from "@hono/zod-validator";
import { eq } from "drizzle-orm";
import fs from "fs/promises";
import { Hono } from "hono";
import path from "path";
import { z } from "zod";
import { selectPostSchema, selectUserSchema } from "../../db/schema.types.ts";
import { db } from "../../db/index.ts";
import { postsTable, usersTable } from "../../db/schema.ts";
import config from "../../../config.ts";
import { getImageMimeType } from "../../mime.ts";

export const imagesRouter = new Hono();

const route = imagesRouter
  .basePath("/images")
  .get(
    "/posts/:postId",
    zValidator("param", z.object({ postId: selectPostSchema.shape.id })),
    async (c) => {
      const { postId } = c.req.valid("param");
      const [post] = await db
        .select()
        .from(postsTable)
        .where(eq(postsTable.id, postId))
        .limit(1);

      if (!post.image_uri) {
        return c.json({ success: false, error: "File not found" }, 404);
      }
      const imageBuffer = await fs.readFile(
        path.join(config.storage.dataPath, "images", post.image_uri)
      );
      const fileExtension = path.extname(post.image_uri).slice(1);
      const contentType =
        getImageMimeType(fileExtension) || "application/octet-stream";

      return c.body(imageBuffer, 200, {
        "Content-Type": contentType,
      });
    }
  )
  .get(
    "/users/:userId",
    zValidator("param", z.object({ userId: selectUserSchema.shape.id })),
    async (c) => {
      const { userId } = c.req.valid("param");
      const [user] = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.id, userId))
        .limit(1);

      if (!user.avatar_uri) {
        return c.json({ success: false, error: "File not found" }, 404);
      }
      const imageBuffer = await fs.readFile(
        path.join(config.storage.dataPath, "images", user.avatar_uri)
      );
      const fileExtension = path.extname(user.avatar_uri).slice(1);
      const contentType =
        getImageMimeType(fileExtension) || "application/octet-stream";

      return c.body(imageBuffer, 200, {
        "Content-Type": contentType,
      });
    }
  );

export type ImagesRoute = typeof route;
