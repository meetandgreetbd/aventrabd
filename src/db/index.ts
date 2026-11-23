import "server-only";
import { drizzle, type MySql2Database } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "./schema";

type Db = MySql2Database<typeof schema>;
const globalForDb = globalThis as unknown as { aventraDb?: Db };

function create(): Db {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");
  // Shared hosting usually allows only a handful of MySQL connections per user.
  const pool = mysql.createPool({ uri: url, connectionLimit: 5, waitForConnections: true });
  return drizzle(pool, { schema, mode: "default" });
}

/** Connects on first use, so importing this module never fails at build time. */
export function getDb(): Db {
  if (!globalForDb.aventraDb) globalForDb.aventraDb = create();
  return globalForDb.aventraDb;
}

export { schema };
