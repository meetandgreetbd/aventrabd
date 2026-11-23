"use server";

import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { getDb, schema } from "@/db";
import { createSession, destroySession, ensureDefaultAdmin } from "@/lib/auth";
import { allow, clientIp } from "@/lib/rate-limit";
import { str, type FormState } from "../form";

// Compared against when the email is unknown, so response time does not reveal which emails exist.
const DUMMY_HASH = "$2b$12$CwTycUXWue0Thq9StjUM0uJ8rT4n6q0aWq7f7Zb1m8eJ0mXh2xk1K";

export async function login(_prev: FormState, data: FormData): Promise<FormState> {
  if (!allow(`login:${await clientIp()}`, 10, 15 * 60 * 1000)) {
    return { error: "Too many attempts. Please wait a few minutes and try again." };
  }
  await ensureDefaultAdmin();
  const email = str(data, "email").toLowerCase();
  const password = String(data.get("password") ?? "");
  const user = (
    await getDb().select().from(schema.users).where(eq(schema.users.email, email)).limit(1)
  )[0];
  const valid = await bcrypt.compare(password, user?.passwordHash ?? DUMMY_HASH);
  if (!user || !valid) return { error: "Incorrect email or password." };
  await createSession(user.id);
  redirect("/admin");
}

export async function logout() {
  await destroySession();
  redirect("/admin/login");
}
