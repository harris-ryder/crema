import { Hono } from "hono";

export const assetsRouter = new Hono();

const route = assetsRouter.basePath("/assets");

export type AssetsRoute = typeof route;
