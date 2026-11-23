import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { and, count, eq, gt, lt } from "drizzle-orm";
import { getDb, schema } from "@/db";

const COOKIE = "aventra_session";
const SESSION_DAYS = 7;

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function createSession(userId: number) {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  const db = getDb();
  await db.delete(schema.sessions).where(lt(schema.sessions.expiresAt, new Date()));
  await db.insert(schema.sessions).values({ id: hashToken(token), userId, expiresAt });
  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    // Secure cookies are dropped over plain http, which would break local production runs.
    secure: (process.env.SITE_URL ?? "").startsWith("https://"),
    path: "/",
    expires: expiresAt,
  });
}

export async function destroySession() {
  const store = await cookies();
  const token = store.get(COOKIE)?.value;
  if (token) await getDb().delete(schema.sessions).where(eq(schema.sessions.id, hashToken(token)));
  store.delete(COOKIE);
}

export async function destroyUserSessions(userId: number) {
  await getDb().delete(schema.sessions).where(eq(schema.sessions.userId, userId));
}

export type CurrentUser = { id: number; name: string; email: string; role: "admin" | "editor" };

export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  const rows = await getDb()
    .select({
      id: schema.users.id,
      name: schema.users.name,
      email: schema.users.email,
      role: schema.users.role,
    })
    .from(schema.sessions)
    .innerJoin(schema.users, eq(schema.users.id, schema.sessions.userId))
    .where(and(eq(schema.sessions.id, hashToken(token)), gt(schema.sessions.expiresAt, new Date())))
    .limit(1);
  return rows[0] ?? null;
});

/** Every admin page and every admin server action starts with one of these. */
export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login");
  return user;
}

export async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== "admin") redirect("/admin");
  return user;
}

/**
 * Creates the default admin from ADMIN_EMAIL / ADMIN_PASSWORD while no user exists,
 * so a fresh database (for example on cPanel, where no seed script can be run) is usable.
 * Does nothing once any user exists, so changing the env values later has no effect.
 */
export async function ensureDefaultAdmin() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) return;
  const db = getDb();
  const [{ total }] = await db.select({ total: count() }).from(schema.users);
  if (total > 0) return;
  await db.insert(schema.users).values({
    name: "Admin",
    email,
    passwordHash: await bcrypt.hash(password, 12),
    role: "admin",
  });
}
