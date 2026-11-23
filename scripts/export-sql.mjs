/**
 * Joins the generated Drizzle migrations into one plain SQL file that can be
 * imported through phpMyAdmin on cPanel (where there is no shell to run migrations).
 *
 *   npm run db:export   ->   database/install.sql
 */
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import path from "node:path";

const source = path.resolve("drizzle");
const files = readdirSync(source)
  .filter((name) => name.endsWith(".sql"))
  .sort();
if (files.length === 0) {
  console.error("No migrations found. Run `npm run db:generate` first.");
  process.exit(1);
}

const sql = files
  .map((name) => {
    // Drizzle separates statements with a marker that MySQL itself cannot parse.
    const body = readFileSync(path.join(source, name), "utf8").replaceAll("--> statement-breakpoint", "");
    return `-- ${name}\n${body.trim()}\n`;
  })
  .join("\n");

mkdirSync("database", { recursive: true });
writeFileSync("database/install.sql", `SET NAMES utf8mb4;\n\n${sql}`);
console.log(`Wrote database/install.sql from ${files.length} migration file(s).`);
