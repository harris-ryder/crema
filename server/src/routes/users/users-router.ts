import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import z from "zod";
import { authRequiredMiddleware } from "../../middlewares/auth-required-middleware.ts";
import { db } from "../../db/index.ts";
import { usersTable } from "../../db/schema.ts";
import { eq } from "drizzle-orm";
import { selectUserSchema } from "../../db/schema.types.ts";
import { uploadImage } from "../../helpers/upload-image.ts";
import { updateUsername } from "./update-username.ts";
import { updateDisplayName } from "./update-display-name.ts";

export const usersRouter = new Hono()
  .basePath("/users")
  .get("/me", authRequiredMiddleware, async (c) => {
    const user = c.get("user");

    const [userRecord] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, user!.id))
      .limit(1);

    if (!userRecord) {
      return c.json<{ success: false; error: string }>(
        {
          success: false,
          error: "User not found",
        },
        404
      );
    }

    return c.json<{
      success: true;
      data: typeof userRecord;
    }>({
      success: true,
      data: userRecord,
    });
  })
  .get(
    "/:id",
    zValidator("param", z.object({ id: selectUserSchema.shape.id })),
    async (c) => {
      const { id } = c.req.valid("param");
      try {
        const [{ username, bio, avatar_uri, updated_at, display_name }] =
          await db
            .select()
            .from(usersTable)
            .where(eq(usersTable.id, id))
            .limit(1);
        return c.json({
          success: true,
          user: { id, username, display_name, bio, avatar_uri, updated_at },
        });
      } catch (error) {
        console.error(error);
        return c.json({
          success: false,
          user: null,
          error:
            error instanceof Error ? error.message : "Internal Server Error",
        });
      }
    }
  )
  .put(
    "/bio",
    authRequiredMiddleware,
    zValidator("json", z.object({ bio: z.string().max(500) })),
    async (c) => {
      const user = c.get("user");
      if (!user) {
        return c.text("Unauthorized", 401);
      }

      const { bio } = c.req.valid("json");

      try {
        const [updatedUser] = await db
          .update(usersTable)
          .set({
            bio,
            updated_at: new Date(),
          })
          .where(eq(usersTable.id, user.id))
          .returning();

        return c.json(
          {
            success: true,
            user: updatedUser,
          },
          200
        );
      } catch (error) {
        console.error(error);
        return c.json(
          {
            success: false,
            error:
              error instanceof Error ? error.message : "Failed to update bio",
          },
          500
        );
      }
    }
  )
  .post(
    "/check-username",
    authRequiredMiddleware,
    zValidator(
      "json",
      z.object({
        username: z
          .string()
          .min(3, "Username must be at least 3 characters")
          .max(30, "Username must be at most 30 characters")
          .regex(
            /^[a-zA-Z0-9_]+$/,
            "Username can only contain letters, numbers, and underscores"
          ),
      })
    ),
    async (c) => {
      const user = c.get("user");
      if (!user) {
        return c.text("Unauthorized", 401);
      }

      const { username } = c.req.valid("json");

      try {
        const [existingUser] = await db
          .select({ id: usersTable.id })
          .from(usersTable)
          .where(eq(usersTable.username, username))
          .limit(1);

        const isAvailable = !existingUser || existingUser.id === user.id;

        return c.json(
          {
            success: true,
            available: isAvailable,
          },
          200
        );
      } catch (error) {
        console.error("Username check error:", error);
        return c.json(
          {
            success: false,
            available: false,
            error:
              error instanceof Error
                ? error.message
                : "Failed to check username",
          },
          500
        );
      }
    }
  )
  .put(
    "/username",
    authRequiredMiddleware,
    zValidator(
      "json",
      z.object({
        username: z
          .string()
          .min(3, "Username must be at least 3 characters")
          .max(30, "Username must be at most 30 characters")
          .regex(
            /^[a-zA-Z0-9_]+$/,
            "Username can only contain letters, numbers, and underscores"
          ),
      })
    ),
    async (c) => {
      const user = c.get("user");
      if (!user) {
        return c.text("Unauthorized", 401);
      }

      const { username } = c.req.valid("json");
      const result = await updateUsername(user.id, username);

      return c.json(result, result.success ? 200 : 400);
    }
  )
  .put(
    "/display-name",
    authRequiredMiddleware,
    zValidator(
      "json",
      z.object({
        display_name: z
          .string()
          .min(3, "Username must be at least 3 characters")
          .max(30, "Username must be at most 30 characters")
          .regex(
            /^[a-zA-Z0-9_]+$/,
            "Username can only contain letters, numbers, and underscores"
          ),
      })
    ),
    async (c) => {
      const user = c.get("user");
      if (!user) {
        return c.text("Unauthorized", 401);
      }

      const { display_name } = c.req.valid("json");
      const result = await updateDisplayName(user.id, display_name);

      return c.json(result, result.success ? 200 : 400);
    }
  );
