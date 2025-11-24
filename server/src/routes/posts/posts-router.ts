import { Hono } from "hono";

export const postsRouter = new Hono();

const route = postsRouter
  .basePath("/posts")
  .get("/ping", (c) => c.text("pong"));

export type PostsRoute = typeof route;
