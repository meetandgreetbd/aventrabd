import "server-only";
import type { Metadata } from "next";
import { getPage, getSettings, type PageSeo } from "./cms";
import { pageInfo, type PageSlug } from "./content";

export function siteUrl() {
  return (process.env.SITE_URL || "http://localhost:3000").replace(/\/$/, "");
}

export function mediaUrl(file: string) {
  return file ? `/media/${file}` : "";
}

type Input = {
  seo: PageSeo;
  fallbackTitle: string;
  fallbackDescription: string;
  path: string;
};

export async function buildMetadata({ seo, fallbackTitle, fallbackDescription, path }: Input) {
  const settings = await getSettings();
  const description = seo.seoDescription || fallbackDescription;
  // A title typed in the admin is used exactly as written; otherwise the
  // page name gets the "| Site name" suffix from the layout's title template.
  const title = seo.seoTitle ? { absolute: seo.seoTitle } : fallbackTitle;
  const hidden = seo.noindex || settings.siteNoindex;
  const image = settings.shareImage ? [mediaUrl(settings.shareImage)] : undefined;

  const metadata: Metadata = {
    title,
    description,
    alternates: { canonical: path },
    robots: hidden ? { index: false, follow: false } : { index: true, follow: true },
    openGraph: {
      title: seo.seoTitle || `${fallbackTitle} | ${settings.siteName}`,
      description,
      url: path,
      siteName: settings.siteName,
      type: "website",
      images: image,
    },
  };
  return metadata;
}

export async function pageMetadata(slug: PageSlug) {
  const { seo } = await getPage(slug);
  const info = pageInfo[slug];
  return buildMetadata({
    seo,
    fallbackTitle: info.name,
    fallbackDescription: info.description,
    path: info.path,
  });
}
