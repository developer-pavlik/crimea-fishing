import "server-only";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not set.");
}

const globalForPg = globalThis as typeof globalThis & { pgPool?: Pool };

export const pool =
  globalForPg.pgPool ??
  new Pool({
    connectionString,
    max: 5,
    query_timeout: 3000, 
    statement_timeout: 3000, 
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2001,
    allowExitOnIdle: true,
  });

globalForPg.pgPool = pool;

export const db = drizzle({ client: pool });
