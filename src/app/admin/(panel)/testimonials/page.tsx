import Link from "next/link";
import { asc } from "drizzle-orm";
import { Badge, Empty, PageTitle, RowActions, Table } from "@/components/admin/ui";
import { getDb, schema } from "@/db";
import { requireUser } from "@/lib/auth";
import { deleteTestimonial } from "@/server/actions/content";

export const metadata = { title: "Testimonials" };

export default async function TestimonialsPage() {
  await requireUser();
  const rows = await getDb()
    .select()
    .from(schema.testimonials)
    .orderBy(asc(schema.testimonials.sortOrder), asc(schema.testimonials.id));

  return (
    <>
      <PageTitle
        title="Testimonials"
        description="Quotes shown on the Life at Aventra page."
        action={{ href: "/admin/testimonials/new", label: "New testimonial" }}
      />
      {rows.length === 0 ? (
        <Empty>No testimonials yet.</Empty>
      ) : (
        <Table head={["Quote", "Author", "Order", "Visibility", "Actions"]}>
          {rows.map((item) => (
            <tr key={item.id}>
              <td className="max-w-md">
                <Link
                  href={`/admin/testimonials/${item.id}`}
                  className="line-clamp-2 font-semibold text-brand hover:underline"
                >
                  {item.quote}
                </Link>
              </td>
              <td>{item.author}</td>
              <td>{item.sortOrder}</td>
              <td>
                <Badge value={item.visible ? "visible" : "hidden"} />
              </td>
              <td>
                <RowActions
                  view={item.visible ? { href: "/life", newTab: true } : undefined}
                  edit={`/admin/testimonials/${item.id}`}
                  onDelete={deleteTestimonial.bind(null, item.id)}
                />
              </td>
            </tr>
          ))}
        </Table>
      )}
    </>
  );
}
