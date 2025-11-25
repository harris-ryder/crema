import { z } from "zod";
import bcrypt from "bcrypt";
import { selectUserSchema } from "../../db/schema.types.ts";
import { db } from "../../db/index.ts";
import { usersTable } from "../../db/schema.ts";
import { eq } from "drizzle-orm";
import { createToken } from "../../helpers.ts/token.ts";

export const signInArgs = selectUserSchema
  .extend({ password: z.string() })
  .pick({ username: true, password: true });

export const signIn = z
  .function()
  .args(signInArgs)
  .returns(z.promise(z.object({ token: z.string() })))
  .implement(async ({ username, password: providedPassword }) => {
    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.username, username))
      .limit(1);
    if (!user.password_salt) {
      throw new Error(`no user salt`);
    }
    const isValid =
      user.password ===
      (await bcrypt.hash(providedPassword, user.password_salt));

    if (!isValid) {
      throw new Error(`invalid username or password`);
    }
    const token = createToken(user);
    return { token };
  });
