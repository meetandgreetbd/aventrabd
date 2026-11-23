import {
  boolean,
  date,
  int,
  json,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 120 }).notNull(),
  email: varchar("email", { length: 190 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 100 }).notNull(),
  role: mysqlEnum("role", ["admin", "editor"]).notNull().default("editor"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const sessions = mysqlTable("sessions", {
  // SHA-256 of the cookie token, so a database leak does not expose live sessions.
  id: varchar("id", { length: 64 }).primaryKey(),
  userId: int("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at").notNull(),
});

export const jobs = mysqlTable("jobs", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 160 }).notNull(),
  slug: varchar("slug", { length: 180 }).notNull().unique(),
  department: varchar("department", { length: 120 }).notNull().default(""),
  location: varchar("location", { length: 120 }).notNull().default(""),
  type: mysqlEnum("type", ["full-time", "part-time", "contract", "internship"])
    .notNull()
    .default("full-time"),
  summary: varchar("summary", { length: 300 }).notNull().default(""),
  description: text("description").notNull(),
  requirements: text("requirements").notNull(),
  deadline: date("deadline", { mode: "string" }),
  status: mysqlEnum("status", ["draft", "open", "closed"]).notNull().default("draft"),
  seoTitle: varchar("seo_title", { length: 200 }).notNull().default(""),
  seoDescription: varchar("seo_description", { length: 320 }).notNull().default(""),
  noindex: boolean("noindex").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
});

export const applications = mysqlTable("applications", {
  id: int("id").autoincrement().primaryKey(),
  jobId: int("job_id")
    .notNull()
    .references(() => jobs.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 120 }).notNull(),
  email: varchar("email", { length: 190 }).notNull(),
  phone: varchar("phone", { length: 40 }).notNull().default(""),
  coverNote: text("cover_note").notNull(),
  cvFile: varchar("cv_file", { length: 80 }).notNull(),
  cvName: varchar("cv_name", { length: 200 }).notNull(),
  status: mysqlEnum("status", ["new", "reviewed", "shortlisted", "rejected"])
    .notNull()
    .default("new"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const members = mysqlTable("members", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 120 }).notNull(),
  title: varchar("title", { length: 160 }).notNull(),
  photo: varchar("photo", { length: 80 }).notNull().default(""),
  bio: text("bio").notNull(),
  group: mysqlEnum("member_group", ["leadership", "team"]).notNull().default("leadership"),
  sortOrder: int("sort_order").notNull().default(0),
  visible: boolean("visible").notNull().default(true),
});

export const testimonials = mysqlTable("testimonials", {
  id: int("id").autoincrement().primaryKey(),
  quote: text("quote").notNull(),
  author: varchar("author", { length: 120 }).notNull(),
  role: varchar("role", { length: 160 }).notNull().default(""),
  sortOrder: int("sort_order").notNull().default(0),
  visible: boolean("visible").notNull().default(true),
});

export const messages = mysqlTable("messages", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 120 }).notNull(),
  email: varchar("email", { length: 190 }).notNull(),
  message: text("message").notNull(),
  isRead: boolean("is_read").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const pages = mysqlTable("pages", {
  slug: varchar("slug", { length: 40 }).primaryKey(),
  content: json("content").$type<Record<string, unknown>>().notNull(),
  seoTitle: varchar("seo_title", { length: 200 }).notNull().default(""),
  seoDescription: varchar("seo_description", { length: 320 }).notNull().default(""),
  noindex: boolean("noindex").notNull().default(false),
  updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
});

export const settings = mysqlTable("settings", {
  key: varchar("setting_key", { length: 40 }).primaryKey(),
  value: json("value").$type<Record<string, unknown>>().notNull(),
});

export type User = typeof users.$inferSelect;
export type Job = typeof jobs.$inferSelect;
export type Application = typeof applications.$inferSelect;
export type Member = typeof members.$inferSelect;
export type Testimonial = typeof testimonials.$inferSelect;
export type Message = typeof messages.$inferSelect;
