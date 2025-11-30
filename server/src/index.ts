import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { cors } from "hono/cors";
import config from "./config.ts";
import { postsRouter } from "./routes/posts/posts-router.ts";
import { usersRouter } from "./routes/users/users-router.ts";

const app = new Hono();

// Add CORS middleware
app.use(
  "*",
  cors({
    origin: [config.frontendUrl],
    credentials: true,
  })
);

const route = app.route("/", usersRouter).route("/", postsRouter);

const port = 3004;
serve({
  fetch: app.fetch,
  port,
});

console.log(`Server running on http://localhost:${port}`);

export { app };
