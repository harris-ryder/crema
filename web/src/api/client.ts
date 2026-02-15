import { hc } from "hono/client";
import type { AppType } from "@server/src/index.ts";
import config from "@/config";


export const client = hc<AppType>(config.backendUrl);
