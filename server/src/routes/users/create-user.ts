import z from "zod";
import bcrypt from "bcrypt";
import { insertUserSchema, selectUserSchema } from "../../db/schema.types.ts";
import { usersTable } from "../../db/schema.ts";
import { db } from "../../db/index.ts";

export const createUser = z
  .function()
  .args(z.object({ user: insertUserSchema.extend({ password: z.string() }) }))
  .returns(z.promise(selectUserSchema))
  .implement(async ({ user }) => {
    const salt = await bcrypt.genSalt();
    const password = await bcrypt.hash(user.password, salt);
    const { username } = user;
    const [createdUser] = await db
      .insert(usersTable)
      .values({
        username,
        password,
        password_salt: salt,
      })
      .returning();
    return createdUser;
  });
