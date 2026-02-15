import { zValidator } from "@hono/zod-validator";
import z from "zod";
import config from "../../../config.ts";
import { db } from "../../db/index.ts";
import { usersTable } from "../../db/schema.ts";
import { eq } from "drizzle-orm";
import { createToken } from "../../helpers/token.ts";
import { Hono } from "hono";
import { randomUUID } from "crypto";

export const oauthRouter = new Hono().post(
  "/oauth/google",
  zValidator("json", z.object({ token: z.string() })),
  async (c) => {
    const accessToken = c.req.valid("json").token;

    // Verify the token was issued for our app
    const tokenInfoRes = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?access_token=${accessToken}`
    );
    if (!tokenInfoRes.ok) {
      throw new Error("Invalid Google access token");
    }
    const tokenInfo = await tokenInfoRes.json();
    if (tokenInfo.aud !== config.oauth.google.webClientId) {
      throw new Error("Token was not issued for this application");
    }

    // Fetch user info
    const res = await fetch(
      "https://www.googleapis.com/oauth2/v3/userinfo",
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    if (!res.ok) {
      throw new Error("Failed to fetch Google user info");
    }
    const payload = await res.json();
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
