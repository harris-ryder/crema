import { Hono } from "hono";
const pingRouter = new Hono();

const route = pingRouter.get("/ping", (c) => c.text("pong"));

export { pingRouter };
export type PingRoute = typeof route;
