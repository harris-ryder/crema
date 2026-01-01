import type { Context, Next } from "hono";
import { verifyToken } from "../helpers/token.ts";

export const decodeTokenMiddleware = async (c: Context, next: Next) => {
  const auth = c.req.header("authorization");
  if (!auth) {
    await next();
    return;
  }
  const [type, token] = auth.split(" ");
  if (type.trim() !== "Bearer") {
    c.text(`invalid authorization type ${type}`, 401);
    return;
  }
  if (!token) {
    return await next();
  }

  const payload = verifyToken({ token });
  if (payload) {
    c.set("user", { id: payload.id });
  }
  return await next();
};
