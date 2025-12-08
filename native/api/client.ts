import { hc } from "hono/client";
import config from "../config";
import type { AppType } from "@server/type.d";

export const client = hc<AppType>(config.urls.backend);
