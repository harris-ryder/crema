import "hono";
import type { ApiRoute } from "./users/users-router";
import type { UsersRoute } from "./users/users-router";
import type { PostsRoute } from "./posts/posts-router";
import type { AssetsRoute } from "./assets/assets-router";

declare module "hono" {
  interface ContextVariableMap {
    user?: {
      id: string;
    };
  }
}

export type AppType = UsersRoute | PostsRoute | AssetsRoute;
