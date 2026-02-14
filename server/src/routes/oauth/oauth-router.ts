import { OAuth2Client } from "google-auth-library";
import { zValidator } from "@hono/zod-validator";
import z from "zod";
import config from "../../../config.ts";
import { db } from "../../db/index.ts";
import { usersTable } from "../../db/schema.ts";
import { eq } from "drizzle-orm";
import { createToken } from "../../helpers/token.ts";
import { Hono } from "hono";
import { randomUUID } from "crypto";

const googleClient = new OAuth2Client();
export const oauthRouter = new Hono().post(
  "/oauth/google",
  zValidator("json", z.object({ token: z.string() })),
  async (c) => {
    const ticket = await googleClient.verifyIdToken({
      idToken: c.req.valid("json").token,
      audience: config.oauth.google.webClientId,
    });
    const payload = ticket.getPayload();
    console.log("payload", payload);
    if (!payload?.email) {
      throw new Error("no email found in google user");
    }

    const email = payload?.email as string;
    console.log("email", email);
    const [existingUser] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email));

    console.log("existingUser", existingUser);

    if (existingUser) {
      return c.json({ success: true, token: createToken(existingUser) });
    }

    const [user] = await db
      .insert(usersTable)
      .values({
        email: payload?.email,
        username: randomUUID(),
        display_name: payload?.email.split("@")[0],
      })
      .returning();

    console.log("user", user);

    return c.json({ success: true, token: createToken(user) });
  }
);
