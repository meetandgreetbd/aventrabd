/**
 * Fills an empty database with the sample content from the design mockup.
 * Safe to re-run: each table is only seeded while it is still empty.
 *
 *   npm run db:seed
 *
 * Also creates the default admin from ADMIN_EMAIL and ADMIN_PASSWORD in .env.
 */
import "dotenv/config";
import bcrypt from "bcryptjs";
import { count } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import type { MySqlTable } from "drizzle-orm/mysql-core";
import mysql from "mysql2/promise";
import * as schema from "../src/db/schema";

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");
  const pool = mysql.createPool({ uri: url, connectionLimit: 2 });
  const db = drizzle(pool, { schema, mode: "default" });

  const isEmpty = async (table: MySqlTable) =>
    (await db.select({ total: count() }).from(table))[0].total === 0;

  if (await isEmpty(schema.members)) {
    await db.insert(schema.members).values([
      { name: "Rahim Hasan", title: "Chief Executive Officer", bio: "", sortOrder: 1 },
      { name: "Nusrat Chowdhury", title: "Chief Operating Officer", bio: "", sortOrder: 2 },
      { name: "Fahad Ahmed", title: "Chief Technology Officer", bio: "", sortOrder: 3 },
    ]);
    console.log("Seeded members (placeholder names from the mockup; replace them in the admin).");
  }

  if (await isEmpty(schema.testimonials)) {
    await db.insert(schema.testimonials).values({
      quote: "At Aventra, I found a place where I can grow, contribute and belong.",
      author: "Aventra Team Member",
      role: "",
      sortOrder: 1,
    });
    console.log("Seeded testimonial.");
  }

  if (await isEmpty(schema.jobs)) {
    await db.insert(schema.jobs).values({
      title: "Sample Position (edit or delete me)",
      slug: "sample-position",
      department: "Operations",
      location: "Dhaka, Bangladesh",
      type: "full-time",
      summary: "An example job post showing how positions appear on the Careers page.",
      description:
        "This is a sample job post.\n\nEdit it in the admin panel under Job posts, or delete it and create your own.",
      requirements: "First requirement\nSecond requirement\nThird requirement",
      status: "draft",
    });
    console.log("Seeded one sample job post (status: draft, so it is not public).");
  }

  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (email && password && (await isEmpty(schema.users))) {
    await db.insert(schema.users).values({
      name: "Admin",
      email,
      passwordHash: await bcrypt.hash(password, 12),
      role: "admin",
    });
    console.log(`Created admin user ${email}.`);
  }

  await pool.end();
  console.log("Done.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
