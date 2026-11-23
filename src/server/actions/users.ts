"use server";

import bcrypt from "bcryptjs";
import { and, count, eq, ne } from "drizzle-orm";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getDb, schema } from "@/db";
import { destroyUserSessions, requireAdmin, requireUser } from "@/lib/auth";
import { firstError, str, type FormState } from "../form";

const MIN_PASSWORD = 10;
const passwordRule = z
  .string()
  .min(MIN_PASSWORD, `Password must be at least ${MIN_PASSWORD} characters.`)
  .max(200);

const userSchema = z.object({
  name: z.string().min(2, "Enter a name.").max(120),
  email: z.email("Enter a valid email address."),
  role: z.enum(["admin", "editor"]),
});

async function otherAdminCount(excludeId: number) {
  const [{ total }] = await getDb()
    .select({ total: count() })
    .from(schema.users)
    .where(and(eq(schema.users.role, "admin"), ne(schema.users.id, excludeId)));
  return total;
}

export async function saveUser(
  id: number | null,
  _prev: FormState,
  data: FormData,
): Promise<FormState> {
  await requireAdmin();
  const parsed = userSchema.safeParse({
    name: str(data, "name"),
    email: str(data, "email").toLowerCase(),
    role: str(data, "role"),
  });
  if (!parsed.success) return { error: firstError(parsed.error) };

  const password = String(data.get("password") ?? "");
  if (id === null || password) {
    const check = passwordRule.safeParse(password);
    if (!check.success) return { error: firstError(check.error) };
  }

  const db = getDb();
  const clash = await db
    .select({ id: schema.users.id })
    .from(schema.users)
    .where(eq(schema.users.email, parsed.data.email))
    .limit(1);
  if (clash[0] && clash[0].id !== id) return { error: "Another user already has this email." };

  if (id === null) {
    await db.insert(schema.users).values({
      ...parsed.data,
      passwordHash: await bcrypt.hash(password, 12),
    });
    redirect("/admin/users");
  }

  if (parsed.data.role !== "admin" && (await otherAdminCount(id)) === 0) {
    return { error: "At least one admin is required. Make another user an admin first." };
  }
  await db
    .update(schema.users)
    .set(password ? { ...parsed.data, passwordHash: await bcrypt.hash(password, 12) } : parsed.data)
    .where(eq(schema.users.id, id));
  // A reset password must log that user out everywhere.
  if (password) await destroyUserSessions(id);
  return { ok: "User saved." };
}

export async function deleteUser(id: number) {
  const current = await requireAdmin();
  // Deleting yourself or the last admin would lock everyone out of the panel.
  if (id !== current.id && (await otherAdminCount(id)) > 0) {
    await getDb().delete(schema.users).where(eq(schema.users.id, id));
  }
  redirect("/admin/users");
}

export async function changePassword(_prev: FormState, data: FormData): Promise<FormState> {
  const current = await requireUser();
  const db = getDb();
  const user = (
    await db.select().from(schema.users).where(eq(schema.users.id, current.id)).limit(1)
  )[0];
  if (!user) return { error: "User not found." };

  const valid = await bcrypt.compare(String(data.get("currentPassword") ?? ""), user.passwordHash);
  if (!valid) return { error: "Current password is incorrect." };

  const next = String(data.get("newPassword") ?? "");
  const check = passwordRule.safeParse(next);
  if (!check.success) return { error: firstError(check.error) };
  if (next !== String(data.get("confirmPassword") ?? "")) {
    return { error: "The new passwords do not match." };
  }

  await db
    .update(schema.users)
    .set({ passwordHash: await bcrypt.hash(next, 12) })
    .where(eq(schema.users.id, current.id));
  return { ok: "Password changed." };
}
