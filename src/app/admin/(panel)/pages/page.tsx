import Link from "next/link";
import { Badge, PageTitle, Table } from "@/components/admin/ui";
import { getDb, schema } from "@/db";
import { requireUser } from "@/lib/auth";
import { pageInfo, pageSlugs } from "@/lib/content";

export const metadata = { title: "SEO" };

export default async function PagesListPage() {
  await requireUser();
  const rows = await getDb().select().from(schema.pages);
  const bySlug = new Map(rows.map((row) => [row.slug, row]));

  return (
    <>
      <PageTitle
        title="SEO"
        description="Set the meta title and description of each page, and whether search engines may index it."
      />
      <Table head={["Page", "Address", "Meta title", "Meta description", "Search engines"]}>
        {pageSlugs.map((slug) => {
          const row = bySlug.get(slug);
          return (
            <tr key={slug}>
              <td>
                <Link href={`/admin/pages/${slug}`} className="font-semibold text-violet-700 hover:underline">
                  {pageInfo[slug].name}
                </Link>
              </td>
              <td className="text-slate-500">{pageInfo[slug].path}</td>
              <td className="max-w-xs truncate">
                {row?.seoTitle || <span className="text-slate-400">Default</span>}
              </td>
              <td className="max-w-xs truncate">
                {row?.seoDescription || <span className="text-slate-400">Default</span>}
              </td>
              <td>
                <Badge value={row?.noindex ? "noindex" : "visible"} />
              </td>
            </tr>
          );
        })}
      </Table>
    </>
  );
}
