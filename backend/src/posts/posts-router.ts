import { Hono } from "hono";

export const postsRouter = new Hono();

const route = postsRouter.basePath("/posts");

export type PostsRoute = typeof route;
