import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { Card, Checkbox, Field, PageTitle, SeoFields } from "@/components/admin/ui";
import { ActionForm } from "@/components/forms/ActionForm";
import { getDb, schema } from "@/db";
import { requireUser } from "@/lib/auth";
import { getSettings } from "@/lib/cms";
import { isPageSlug, pageInfo } from "@/lib/content";
import { mediaUrl } from "@/lib/seo";
import { savePage } from "@/server/actions/content";

export const metadata = { title: "Page SEO" };

export default async function PageSeoPage({ params }: { params: Promise<{ slug: string }> }) {
  const user = await requireUser();
  const { slug } = await params;
  if (!isPageSlug(slug)) notFound();

  const row = (await getDb().select().from(schema.pages).where(eq(schema.pages.slug, slug)).limit(1))[0];
  const info = pageInfo[slug];
  // Site-wide SEO options live on the Home screen so there is a single place for SEO.
  const settings = slug === "home" && user.role === "admin" ? await getSettings() : null;

  return (
    <>
      <PageTitle
        title={`${info.name} page SEO`}
        description={`Address: ${info.path}`}
        back={{ href: "/admin/pages", label: "SEO" }}
        action={{ href: info.path, label: "View on site" }}
      />
      <ActionForm action={savePage.bind(null, slug)} submitLabel="Save SEO" variant="admin" className="space-y-5">
        <SeoFields
          seoTitle={row?.seoTitle ?? ""}
          seoDescription={row?.seoDescription ?? ""}
          noindex={row?.noindex ?? false}
          fallbackTitle={`${info.name} | Aventra`}
        />
        {settings && (
          <Card title="Whole site" description="These two options apply to every page.">
            {settings.shareImage && (
              <div className="flex items-center gap-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={mediaUrl(settings.shareImage)}
                  alt="Current share image"
                  className="h-20 w-36 rounded-lg object-cover"
                />
                <Checkbox label="Remove current share image" name="removeShareImage" />
              </div>
            )}
            <Field
              label={settings.shareImage ? "Replace share image" : "Share image"}
              name="shareImage"
              type="file"
              accept=".jpg,.jpeg,.png,.webp"
              hint="Shown when any page is shared on Facebook, LinkedIn or WhatsApp. 1200 × 630 px, up to 4 MB."
            />
            <Checkbox
              label="Hide the whole site from search engines"
              name="siteNoindex"
              defaultChecked={settings.siteNoindex}
              hint="Use while the site is being prepared. Overrides every page's own setting, empties the sitemap and blocks crawlers in robots.txt."
            />
          </Card>
        )}
      </ActionForm>
    </>
  );
}
