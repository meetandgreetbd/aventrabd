import "server-only";
import { cache } from "react";
import { connection } from "next/server";
import { and, asc, desc, eq } from "drizzle-orm";
import { getDb, schema } from "@/db";
import {
  mergeWithDefaults,
  pageDefaults,
  settingsDefaults,
  type PageContent,
  type PageSlug,
  type SiteSettings,
} from "./content";

let warned = false;

/**
 * Public pages must keep rendering if MySQL is unreachable, so reads fall back
 * to the built-in defaults instead of crashing the page.
 */
async function read<T>(query: () => Promise<T>, fallback: T): Promise<T> {
  await connection(); // content is editable, so always render at request time
  try {
    return await query();
  } catch (error) {
    if (!warned) {
      warned = true;
      console.error("[cms] database read failed, serving built-in defaults:", error);
    }
    return fallback;
  }
}

export type PageSeo = { seoTitle: string; seoDescription: string; noindex: boolean };
const emptySeo: PageSeo = { seoTitle: "", seoDescription: "", noindex: false };

const getPageRow = cache(async (slug: PageSlug) =>
  read(
    async () =>
      (await getDb().select().from(schema.pages).where(eq(schema.pages.slug, slug)).limit(1))[0],
    undefined,
  ),
);

export async function getPage<S extends PageSlug>(
  slug: S,
): Promise<{ content: PageContent<S>; seo: PageSeo }> {
  const row = await getPageRow(slug);
  return {
    content: mergeWithDefaults(pageDefaults[slug], row?.content),
    seo: row
      ? { seoTitle: row.seoTitle, seoDescription: row.seoDescription, noindex: row.noindex }
      : emptySeo,
  };
}

export const getAllPageSeo = cache(async () =>
  read(
    () =>
      getDb()
        .select({ slug: schema.pages.slug, noindex: schema.pages.noindex })
        .from(schema.pages),
    [],
  ),
);

export const getSettings = cache(async (): Promise<SiteSettings> => {
  const row = await read(
    async () =>
      (
        await getDb()
          .select()
          .from(schema.settings)
          .where(eq(schema.settings.key, "site"))
          .limit(1)
      )[0],
    undefined,
  );
  return mergeWithDefaults(settingsDefaults, row?.value);
});

export const getOpenJobs = cache(async () =>
  read(
    () =>
      getDb()
        .select()
        .from(schema.jobs)
        .where(eq(schema.jobs.status, "open"))
        .orderBy(desc(schema.jobs.createdAt)),
    [],
  ),
);

/** Open and closed jobs are viewable by link; drafts are never public. */
export const getPublicJob = cache(async (slug: string) => {
  const job = await read(
    async () =>
      (await getDb().select().from(schema.jobs).where(eq(schema.jobs.slug, slug)).limit(1))[0],
    undefined,
  );
  return job && job.status !== "draft" ? job : undefined;
});

export const getMembers = cache(async (group: "leadership" | "team") =>
  read(
    () =>
      getDb()
        .select()
        .from(schema.members)
        .where(and(eq(schema.members.group, group), eq(schema.members.visible, true)))
        .orderBy(asc(schema.members.sortOrder), asc(schema.members.id)),
    [],
  ),
);

export const getTestimonials = cache(async () =>
  read(
    () =>
      getDb()
        .select()
        .from(schema.testimonials)
        .where(eq(schema.testimonials.visible, true))
        .orderBy(asc(schema.testimonials.sortOrder), asc(schema.testimonials.id)),
    [],
  ),
);

export function isJobAcceptingApplications(job: { status: string; deadline: string | null }) {
  if (job.status !== "open") return false;
  if (!job.deadline) return true;
  // Deadline is inclusive: applications are accepted through the end of that day.
  return new Date(`${job.deadline}T23:59:59`) >= new Date();
}
