import "hono";
import type { UsersRoute } from "./routes/users/users-router.ts";
import type { PostsRoute } from "./routes/posts/posts-router.ts";
import type { ImagesRoute } from "./routes/images/images-router.ts";

declare module "hono" {
  interface ContextVariableMap {
    user?: {
      id: string;
    };
  }
}

export type AppType = UsersRoute | PostsRoute | ImagesRoute;
