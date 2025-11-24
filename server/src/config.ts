import path from "path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));

export const config = {
  frontendUrl: process.env.VITE_FRONTEND_URL || "https:localhost:5173",
  staticFilesPath: process.env.STATIC_FILES_PATH || "./static",
  dataPath: process.env.DATA_PATH || path.join(__dirname, "../data"),
  jwt: {
    secret: process.env.JWT_SECRET || "ssh",
  },
  postgres: {
    connectionString:
      process.env.POSTGRES_CONNECTION_STRING ||
      "postgres://postgres:shh@localhost:5432/crema",
  },
};

export default config;
