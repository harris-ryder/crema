import { hc } from "hono/client";
import type { AppType } from "@server/type.d";

const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

export const client = hc<AppType>(backendUrl, {
  headers: {
    "ngrok-skip-browser-warning": "true",
  },
});
