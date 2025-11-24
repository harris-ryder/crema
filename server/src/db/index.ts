import { drizzle } from "drizzle-orm/node-postgres";
import { config } from "../config.ts";
import pg from "pg";

const pool = new pg.Pool({
  connectionString: config.postgres.connectionString,
});

export const db = drizzle({ client: pool });
