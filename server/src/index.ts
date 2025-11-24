import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { cors } from "hono/cors";
import config from "./config.ts";
import { usersRouter } from "./users/users-router.ts";
import { postsRouter } from "./posts/posts-router.ts";
import { assetsRouter } from "./assets/assets-router.ts";

const app = new Hono();

// Add CORS middleware
app.use(
  "*",
  cors({
    origin: [config.frontendUrl],
    credentials: true,
  })
);

const route = app
  .route("/", usersRouter)
  .route("/", postsRouter)
  .route("/", assetsRouter);

serve(app);

export { app };
