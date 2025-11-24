import type { AppType } from "@backend/src/type";
import config from "./config";
import { hc } from "hono/client";

export const client = hc<AppType>(config.backendUrl);
