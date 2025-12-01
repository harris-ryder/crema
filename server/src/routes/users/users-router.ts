import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import z from "zod";
import { authRequiredMiddleware } from "../../middlewares/auth-required-middleware.ts";
import { db } from "../../db/index.ts";
import { usersTable } from "../../db/schema.ts";
import { eq } from "drizzle-orm";
import { insertUserSchema, selectUserSchema } from "../../db/schema.types.ts";
import { createUser } from "./create-user.ts";
import { createToken } from "../../helpers.ts/token.ts";
import { signIn, signInArgs } from "./sign-in.ts";
import { uploadImage } from "../../helpers.ts/upload-image.ts";

export const usersRouter = new Hono();

const route = usersRouter
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

    const { password, password_salt, ...userWithoutPasswordData } = userRecord;

    return c.json<{
      success: true;
      data: { user: Omit<typeof userRecord, "password" | "password_salt"> };
    }>({
      success: true,
      data: { user: userWithoutPasswordData },
    });
  })
  .get(
    "/:id",
    zValidator("param", z.object({ id: selectUserSchema.shape.id })),
    async (c) => {
      const { id } = c.req.valid("param");
      try {
        const [{ username, bio, avatar_uri }] = await db
          .select()
          .from(usersTable)
          .where(eq(usersTable.id, id))
          .limit(1);
        return c.json({
          success: true,
          user: { id, username, bio, avatar_uri },
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
  .post(
    "/sign-up",
    zValidator("json", insertUserSchema.extend({ password: z.string() })),
    async (c) => {
      try {
        const user = await createUser({ user: c.req.valid("json") });
        const token = createToken(user);

        return c.json<{ success: true; token: string }>(
          { success: true, token },
          201
        );
      } catch (error) {
        console.error(error);
        return c.json<{ success: false; error: any }>(
          {
            success: false,
            error:
              error instanceof Error ? error.message : "Internal Server Error",
          },
          500
        );
      }
    }
  )
  .post("/sign-in", zValidator("json", signInArgs), async (c) => {
    try {
      const { token } = await signIn(c.req.valid("json"));
      return c.json<{ success: true; token: string }>({ success: true, token });
    } catch (error) {
      console.error(error);
      return c.json<{ success: false; error: any }>({
        success: false,
        error: error instanceof Error ? error.message : "Internal Server Error",
      });
    }
  })
  .put(
    "/profile-picture",
    authRequiredMiddleware,
    zValidator(
      "form",
      z.object({
        file: z
          .instanceof(File)
          .refine((file) => file.type.startsWith("image/"), {
            message: "File must be an image",
          }),
      })
    ),
    async (c) => {
      const user = c.get("user");
      if (!user) {
        return c.text("Unauthorized", 401);
      }

      const body = await c.req.parseBody();
      if (!(body["file"] instanceof File)) {
        return c.text("Invalid file", 400);
      }

      try {
        const avatarUri = await uploadImage({ file: body["file"] });

        const [updatedUser] = await db
          .update(usersTable)
          .set({
            avatar_uri: avatarUri,
            updated_at: new Date(),
          })
          .where(eq(usersTable.id, user.id))
          .returning();

        const { password, password_salt, ...userWithoutPassword } = updatedUser;

        return c.json(
          {
            success: true,
            user: userWithoutPassword,
          },
          200
        );
      } catch (error) {
        console.error(error);
        return c.json(
          {
            success: false,
            error:
              error instanceof Error ? error.message : "Failed to upload image",
          },
          500
        );
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

        const { password, password_salt, ...userWithoutPassword } = updatedUser;

        return c.json(
          {
            success: true,
            user: userWithoutPassword,
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
  );

export type UsersRoute = typeof route;
