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
  environment: getEnv("NODE_ENV", "development"),
  ports: {
    server: parseInt(getEnv("PORT", "3000")),
  },
  urls: {
    // Frontend apps
    web: getEnv("FRONTEND_URL", "http://localhost:5173"),
  },
  database: {
    connectionString: getEnv(
      "POSTGRES_CONNECTION",
      "postgres://postgres:shh@localhost:5433/crema"
    ),
  },
  jwt: {
    secret: getEnv("JWT_SECRET", "your-jwt-secret-here"),
  },
  oauth: {
    google: {
      webClientId: getEnv(
        "GOOGLE_WEB_CLIENT_ID",
        "157821791942-m36u8iqssodtm9440adgr8noq3vmut9m.apps.googleusercontent.com"
      ),
    },
  },
  storage: {
    dataPath: getEnv("DATA_PATH", path.join(__dirname, "data")),
  },
} as const;

export default config;
