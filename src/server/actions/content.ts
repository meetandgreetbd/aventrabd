"use server";

import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getDb, schema } from "@/db";
import { requireAdmin, requireUser } from "@/lib/auth";
import { isPageSlug, type SiteSettings } from "@/lib/content";
import { getSettings } from "@/lib/cms";
import { deleteUpload, hasFile, saveUpload } from "@/lib/storage";
import { checked, firstError, int, str, type FormState } from "../form";

/* ---------- Members ---------- */

const memberSchema = z.object({
  name: z.string().min(2, "Enter the member's name.").max(120),
  title: z.string().min(2, "Enter a job title.").max(160),
  bio: z.string().max(5000),
  group: z.enum(["leadership", "team"]),
});

export async function saveMember(
  id: number | null,
  _prev: FormState,
  data: FormData,
): Promise<FormState> {
  await requireUser();
  const parsed = memberSchema.safeParse({
    name: str(data, "name"),
    title: str(data, "title"),
    bio: str(data, "bio"),
    group: str(data, "group"),
  });
  if (!parsed.success) return { error: firstError(parsed.error) };

  const db = getDb();
  const existing =
    id === null
      ? undefined
      : (await db.select().from(schema.members).where(eq(schema.members.id, id)).limit(1))[0];

  let photo = existing?.photo ?? "";
  const upload = data.get("photo");
  if (hasFile(upload)) {
    const saved = await saveUpload("images", upload);
    if (!saved.ok) return { error: saved.error };
    if (photo) await deleteUpload("images", photo);
    photo = saved.file;
  } else if (checked(data, "removePhoto") && photo) {
    await deleteUpload("images", photo);
    photo = "";
  }

  const values = {
    ...parsed.data,
    photo,
    sortOrder: int(data, "sortOrder"),
    visible: checked(data, "visible"),
  };
  if (id === null) {
    await db.insert(schema.members).values(values);
    redirect("/admin/members");
  }
  await db.update(schema.members).set(values).where(eq(schema.members.id, id));
  return { ok: "Member saved." };
}

export async function deleteMember(id: number) {
  await requireUser();
  const db = getDb();
  const row = (await db.select().from(schema.members).where(eq(schema.members.id, id)).limit(1))[0];
  if (row) {
    await db.delete(schema.members).where(eq(schema.members.id, id));
    if (row.photo) await deleteUpload("images", row.photo);
  }
  redirect("/admin/members");
}

/* ---------- Testimonials ---------- */

const testimonialSchema = z.object({
  quote: z.string().min(10, "Enter the testimonial text.").max(2000),
  author: z.string().min(2, "Enter who said it.").max(120),
  role: z.string().max(160),
});

export async function saveTestimonial(
  id: number | null,
  _prev: FormState,
  data: FormData,
): Promise<FormState> {
  await requireUser();
  const parsed = testimonialSchema.safeParse({
    quote: str(data, "quote"),
    author: str(data, "author"),
    role: str(data, "role"),
  });
  if (!parsed.success) return { error: firstError(parsed.error) };
  const values = {
    ...parsed.data,
    sortOrder: int(data, "sortOrder"),
    visible: checked(data, "visible"),
  };
  const db = getDb();
  if (id === null) {
    await db.insert(schema.testimonials).values(values);
    redirect("/admin/testimonials");
  }
  await db.update(schema.testimonials).set(values).where(eq(schema.testimonials.id, id));
  return { ok: "Testimonial saved." };
}

export async function deleteTestimonial(id: number) {
  await requireUser();
  await getDb().delete(schema.testimonials).where(eq(schema.testimonials.id, id));
  redirect("/admin/testimonials");
}

/* ---------- Contact inbox ---------- */

export async function setMessageRead(id: number, isRead: boolean) {
  await requireUser();
  await getDb().update(schema.messages).set({ isRead }).where(eq(schema.messages.id, id));
  redirect("/admin/messages");
}

export async function deleteMessage(id: number) {
  await requireUser();
  await getDb().delete(schema.messages).where(eq(schema.messages.id, id));
  redirect("/admin/messages");
}

/* ---------- SEO ---------- */

async function writeSettings(value: SiteSettings) {
  await getDb()
    .insert(schema.settings)
    .values({ key: "site", value })
    .onDuplicateKeyUpdate({ set: { value } });
}

const seoSchema = z.object({
  seoTitle: z.string().max(200, "Meta title must be 200 characters or fewer."),
  seoDescription: z.string().max(320, "Meta description must be 320 characters or fewer."),
});

export async function savePage(slug: string, _prev: FormState, data: FormData): Promise<FormState> {
  const user = await requireUser();
  if (!isPageSlug(slug)) return { error: "Unknown page." };
  const seo = seoSchema.safeParse({
    seoTitle: str(data, "seoTitle"),
    seoDescription: str(data, "seoDescription"),
  });
  if (!seo.success) return { error: firstError(seo.error) };

  // The Home page's SEO screen also holds the two site-wide SEO options (admins only),
  // so that all SEO lives in one place.
  if (slug === "home" && user.role === "admin") {
    const current = await getSettings();
    let shareImage = current.shareImage;
    const upload = data.get("shareImage");
    if (hasFile(upload)) {
      const saved = await saveUpload("images", upload);
      if (!saved.ok) return { error: saved.error };
      if (shareImage) await deleteUpload("images", shareImage);
      shareImage = saved.file;
    } else if (checked(data, "removeShareImage") && shareImage) {
      await deleteUpload("images", shareImage);
      shareImage = "";
    }
    await writeSettings({ ...current, shareImage, siteNoindex: checked(data, "siteNoindex") });
  }

  // Only the SEO columns are written; page text lives in src/lib/content.ts.
  const values = { ...seo.data, noindex: checked(data, "noindex") };
  await getDb()
    .insert(schema.pages)
    .values({ slug, content: {}, ...values })
    .onDuplicateKeyUpdate({ set: values });
  return { ok: "SEO saved. The live site is updated." };
}

/* ---------- Contact info & site settings ---------- */

const optionalUrl = z.union([
  z.literal(""),
  z.url({ protocol: /^https?$/, error: "Social links must start with http:// or https://" }),
]);

/** One or more email addresses separated by commas; empty turns that notification off. */
const emailList = (what: string) =>
  z
    .string()
    .max(300)
    .refine(
      (value) =>
        value
          .split(",")
          .map((part) => part.trim())
          .filter(Boolean)
          .every((part) => z.email().safeParse(part).success),
      `Enter valid email addresses for ${what}, separated by commas.`,
    );

const settingsSchema = z.object({
  siteName: z.string().min(1, "Enter the site name.").max(80),
  tagline: z.string().max(160),
  phone: z.string().max(40),
  email: z.union([z.literal(""), z.email("Enter a valid public email address.")]),
  address: z.string().max(300),
  linkedin: optionalUrl,
  facebook: optionalUrl,
  youtube: optionalUrl,
  x: optionalUrl,
  contactNotifyEmail: emailList("contact messages"),
  applicationNotifyEmail: emailList("job applications"),
  // Strict formats: these IDs are written into a script tag on every public page.
  gtmId: z.union([z.literal(""), z.string().regex(/^GTM-[A-Z0-9]{4,12}$/, "The Tag Manager ID looks like GTM-XXXXXXX.")]),
  gaId: z.union([z.literal(""), z.string().regex(/^G-[A-Z0-9]{4,14}$/, "The Analytics measurement ID looks like G-XXXXXXXXXX.")]),
});

export async function saveSettings(_prev: FormState, data: FormData): Promise<FormState> {
  await requireAdmin();
  const fields = Object.keys(settingsSchema.shape) as (keyof typeof settingsSchema.shape)[];
  const parsed = settingsSchema.safeParse(
    Object.fromEntries(
      fields.map((field) => [field, field === "gtmId" || field === "gaId" ? str(data, field).toUpperCase() : str(data, field)]),
    ),
  );
  if (!parsed.success) return { error: firstError(parsed.error) };

  // Keeps the SEO options (share image, site-wide noindex) that are managed on the Home SEO screen.
  await writeSettings({ ...(await getSettings()), ...parsed.data });
  return { ok: "Settings saved." };
}
