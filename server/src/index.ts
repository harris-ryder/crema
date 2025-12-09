import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { cors } from "hono/cors";
import config from "../config.ts";
import { postsRouter } from "./routes/posts/posts-router.ts";
import { usersRouter } from "./routes/users/users-router.ts";
import { decodeTokenMiddleware } from "./middlewares/decode-token-middleware.ts";
import { imagesRouter } from "./routes/images/images-router.ts";
import { oauthRouter } from "./routes/oauth/oauth-router.ts";

const app = new Hono();

app.use(decodeTokenMiddleware);
app.use(
  "*",
  cors({
    origin: [config.urls.web],
    credentials: true,
  })
);

app
  .route("/", usersRouter)
  .route("/", oauthRouter)
  .route("/", postsRouter)
  .route("/", imagesRouter);

serve({
  fetch: app.fetch,
  port: config.ports.server,
});

console.log(`Server running on http://localhost:${config.ports.server}`);

export { app };
