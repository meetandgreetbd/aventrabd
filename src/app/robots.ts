import type { MetadataRoute } from "next";
import { getSettings } from "@/lib/cms";
import { siteUrl } from "@/lib/seo";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const settings = await getSettings();
  if (settings.siteNoindex) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }
  return {
    rules: { userAgent: "*", allow: "/", disallow: "/admin" },
    sitemap: `${siteUrl()}/sitemap.xml`,
  };
}
