import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { cors } from "hono/cors";
import config from "../config.ts";
import { postsRouter } from "./routes/posts/posts-router.ts";
import { usersRouter } from "./routes/users/users-router.ts";
import { decodeTokenMiddleware } from "./middlewares/decode-token-middleware.ts";
import { imagesRouter } from "./routes/images/images-router.ts";
import { oauthRouter } from "./routes/oauth/oauth-router.ts";
import { healthRouter } from "./routes/health/health.ts";
import { db } from "./db/index.ts";

const app = new Hono();

app.use(decodeTokenMiddleware);
app.use(
  "*",
  cors({
    origin: [config.urls.web],
    credentials: true,
  })
);

app.route("/", healthRouter);

// API v1 routes
const v1 = new Hono();
v1.route("/", usersRouter)
  .route("/", oauthRouter)
  .route("/", postsRouter)
  .route("/", imagesRouter);

app.route("/v1", v1);

serve({
  fetch: app.fetch,
  port: config.ports.server,
});

console.log(`Server running on http://localhost:${config.ports.server}`);

// Check database connection
db.execute("SELECT 1")
  .then(() => console.log("postgres connected successfully"))
  .catch((err) => console.error("postgres connection failed:", err.message));

export { app };
