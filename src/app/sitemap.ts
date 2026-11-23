import type { MetadataRoute } from "next";
import { getAllPageSeo, getOpenJobs, getSettings } from "@/lib/cms";
import { pageInfo, pageSlugs } from "@/lib/content";
import { siteUrl } from "@/lib/seo";

/** Lists only what search engines are allowed to index. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [settings, pageSeo, jobs] = await Promise.all([getSettings(), getAllPageSeo(), getOpenJobs()]);
  if (settings.siteNoindex) return [];

  const hidden = new Set(pageSeo.filter((page) => page.noindex).map((page) => page.slug));
  const base = siteUrl();
  return [
    ...pageSlugs
      .filter((slug) => !hidden.has(slug))
      .map((slug) => ({ url: `${base}${pageInfo[slug].path === "/" ? "" : pageInfo[slug].path}` })),
    ...jobs
      .filter((job) => !job.noindex)
      .map((job) => ({ url: `${base}/careers/${job.slug}`, lastModified: job.updatedAt })),
  ];
}
