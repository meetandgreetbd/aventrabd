"use server";

import { and, eq, ne } from "drizzle-orm";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getDb, schema } from "@/db";
import { requireUser } from "@/lib/auth";
import { deleteUpload } from "@/lib/storage";
import { checked, firstError, slugify, str, type FormState } from "../form";

const jobSchema = z.object({
  title: z.string().min(3, "Enter a job title.").max(160),
  slug: z.string().max(160),
  department: z.string().max(120),
  location: z.string().max(120),
  type: z.enum(["full-time", "part-time", "contract", "internship"]),
  summary: z.string().max(300, "Summary must be 300 characters or fewer."),
  description: z.string().min(10, "Enter a job description.").max(20000),
  requirements: z.string().max(10000),
  deadline: z.union([z.literal(""), z.iso.date("Enter a valid deadline date.")]),
  status: z.enum(["draft", "open", "closed"]),
  seoTitle: z.string().max(200),
  seoDescription: z.string().max(320, "Meta description must be 320 characters or fewer."),
});

async function uniqueSlug(base: string, ignoreId: number | null) {
  const db = getDb();
  for (let attempt = 1; attempt < 50; attempt += 1) {
    const candidate = attempt === 1 ? base : `${base}-${attempt}`;
    const clash = await db
      .select({ id: schema.jobs.id })
      .from(schema.jobs)
      .where(
        ignoreId === null
          ? eq(schema.jobs.slug, candidate)
          : and(eq(schema.jobs.slug, candidate), ne(schema.jobs.id, ignoreId)),
      )
      .limit(1);
    if (clash.length === 0) return candidate;
  }
  return `${base}-${Date.now()}`;
}

export async function saveJob(
  id: number | null,
  _prev: FormState,
  data: FormData,
): Promise<FormState> {
  await requireUser();
  const parsed = jobSchema.safeParse({
    title: str(data, "title"),
    slug: str(data, "slug"),
    department: str(data, "department"),
    location: str(data, "location"),
    type: str(data, "type"),
    summary: str(data, "summary"),
    description: str(data, "description"),
    requirements: str(data, "requirements"),
    deadline: str(data, "deadline"),
    status: str(data, "status"),
    seoTitle: str(data, "seoTitle"),
    seoDescription: str(data, "seoDescription"),
  });
  if (!parsed.success) return { error: firstError(parsed.error) };

  const base = slugify(parsed.data.slug || parsed.data.title);
  if (!base) return { error: "The URL slug must contain letters or numbers." };
  const values = {
    ...parsed.data,
    slug: await uniqueSlug(base, id),
    deadline: parsed.data.deadline || null,
    noindex: checked(data, "noindex"),
  };

  const db = getDb();
  if (id === null) {
    await db.insert(schema.jobs).values(values);
    redirect("/admin/jobs");
  }
  await db.update(schema.jobs).set(values).where(eq(schema.jobs.id, id));
  return { ok: "Job saved." };
}

export async function deleteJob(id: number) {
  await requireUser();
  const db = getDb();
  const files = await db
    .select({ cvFile: schema.applications.cvFile })
    .from(schema.applications)
    .where(eq(schema.applications.jobId, id));
  await db.delete(schema.jobs).where(eq(schema.jobs.id, id)); // applications cascade
  await Promise.all(files.map((row) => deleteUpload("cv", row.cvFile)));
  redirect("/admin/jobs");
}

export async function setApplicationStatus(id: number, data: FormData) {
  await requireUser();
  const status = z.enum(["new", "reviewed", "shortlisted", "rejected"]).safeParse(str(data, "status"));
  if (!status.success) return;
  await getDb()
    .update(schema.applications)
    .set({ status: status.data })
    .where(eq(schema.applications.id, id));
  redirect(`/admin/applications/${id}`);
}

export async function deleteApplication(id: number) {
  await requireUser();
  const db = getDb();
  const row = (
    await db.select().from(schema.applications).where(eq(schema.applications.id, id)).limit(1)
  )[0];
  if (row) {
    await db.delete(schema.applications).where(eq(schema.applications.id, id));
    await deleteUpload("cv", row.cvFile);
  }
  redirect("/admin/applications");
}
