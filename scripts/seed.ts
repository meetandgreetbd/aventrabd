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

  // Two demo job posts (status: open, so they show on the site). Added once, matched by slug;
  // edit or delete them in the admin under Job posts.
  const demoJobs = [
    {
      title: "HR & Admin Executive (Demo)",
      slug: "hr-admin-executive-demo",
      department: "Human Resources",
      location: "Dhaka, Bangladesh",
      type: "full-time" as const,
      summary: "Demo post: support recruitment, onboarding and day-to-day office administration.",
      description:
        "This is a demo job post to show how positions look on the website.\n\nThe HR & Admin Executive supports the people team with recruitment, onboarding and employee records, and keeps the office running smoothly.\n\nYou will work closely with managers across the group and be a first point of contact for colleagues.",
      requirements:
        "Bachelor's degree in a relevant field\n1-3 years of experience in HR or administration\nGood written and spoken communication in Bangla and English\nComfortable with MS Office or Google Workspace\nOrganised, discreet and good with people",
      status: "open" as const,
    },
    {
      title: "Business Development Officer (Demo)",
      slug: "business-development-officer-demo",
      department: "Business Development",
      location: "Dhaka, Bangladesh",
      type: "full-time" as const,
      summary: "Demo post: find new opportunities and build lasting client relationships.",
      description:
        "This is a demo job post to show how positions look on the website.\n\nThe Business Development Officer identifies new opportunities, prepares proposals and builds relationships with clients and partners.\n\nYou will work with teams across the group to turn opportunities into long-term business.",
      requirements:
        "Bachelor's degree in business or a related field\n2+ years of experience in sales or business development\nStrong communication and presentation skills\nAble to plan your own work and meet targets\nWilling to travel for client meetings",
      status: "open" as const,
    },
  ];
  const existingSlugs = new Set((await db.select({ slug: schema.jobs.slug }).from(schema.jobs)).map((row) => row.slug));
  for (const job of demoJobs) {
    if (existingSlugs.has(job.slug)) continue;
    await db.insert(schema.jobs).values(job);
    console.log(`Seeded demo job: ${job.title}`);
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
