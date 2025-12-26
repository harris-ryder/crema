import { dirname } from "path";
import { fileURLToPath } from "url";
import path from "path";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

// Get __dirname in ES modules
const __dirname = dirname(fileURLToPath(import.meta.url));

// Helper function to get environment variables with fallback
function getEnv(key: string, defaultValue: string): string {
  return process.env[key] || defaultValue;
}

const config = {
  // Environment
  environment: getEnv("NODE_ENV", "development"),

  // Ports
  ports: {
    server: parseInt(getEnv("PORT", "3004")),
    web: 5173,
  },

  // URLs
  urls: {
    // Backend API
    backend: getEnv("BACKEND_URL", "http://192.168.3.158:3004"),

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
