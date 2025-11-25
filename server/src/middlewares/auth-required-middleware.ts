import type { Context, Next } from "hono";

export const authRequiredMiddleware = async (c: Context, next: Next) => {
  if (!c.get("user")) {
    c.text("Unauthorized", 401);
    return;
  }
  await next();
};
