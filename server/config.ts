/**
 * Global configuration for Crema
 * Shared across server, web, and native applications
 */

import { dirname } from "path";
import { fileURLToPath } from "url";
import path from "path";

// Get __dirname in ES modules
// Comment out for react native and web
const __dirname = dirname(fileURLToPath(import.meta.url));

// Environment-aware helper to safely access process.env
const getEnv = (key: string, fallback?: string) => {
  // Use globalThis to access process without TypeScript errors
  const globalProcess = (globalThis as any).process;
  if (typeof globalProcess !== "undefined" && globalProcess.env) {
    return globalProcess.env[key] || fallback;
  }
  return fallback;
};

const config = {
  // Environment
  environment: getEnv("NODE_ENV", "development"),

  // Ports
  ports: {
    server: 3004,
    web: 5173,
  },

  // URLs
  urls: {
    // Backend API
    backend: getEnv("BACKEND_URL", "http://10.19.3.247:3004"),

    // Frontend apps
    web: getEnv("FRONTEND_URL", "http://localhost:5173"),
  },

  // Database
  database: {
    connectionString: getEnv(
      "POSTGRES_CONNECTION_STRING",
      "postgres://postgres:shh@localhost:5433/crema"
    ),
  },

  // Authentication
  jwt: {
    secret: getEnv("JWT_SECRET", "your-jwt-secret-here"),
  },

  // OAuth
  oauth: {
    google: {
      webClientId: getEnv(
        "GOOGLE_WEB_CLIENT_ID",
        "157821791942-m36u8iqssodtm9440adgr8noq3vmut9m.apps.googleusercontent.com"
      ),
    },
  },

  // File storage
  // Comment out for react native and web
  storage: {
    staticFilesPath: getEnv(
      "STATIC_FILES_PATH",
      path.join(__dirname, "static")
    ),
    dataPath: getEnv("DATA_PATH", path.join(__dirname, "data")),
  },
} as const;

export default config;
