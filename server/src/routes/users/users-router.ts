import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import z from "zod";

export const usersRouter = new Hono();

const route = usersRouter
  .basePath("/users")
  .post(
    "/sign-in",
    zValidator(
      "json",
      z.object({
        username: z.string(),
        password: z.string(),
      })
    ),
    async (c) => {}
  )
  .post(
    "/sign-up",
    zValidator(
      "json",
      z.object({
        username: z.string(),
        password: z.string(),
      })
    )
  );

export type UsersRoute = typeof route;
