import Link from "next/link";
import { asc } from "drizzle-orm";
import { Badge, Empty, PageTitle, Table } from "@/components/admin/ui";
import { getDb, schema } from "@/db";
import { requireUser } from "@/lib/auth";

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
        <Table head={["Quote", "Author", "Order", "Visibility"]}>
          {rows.map((item) => (
            <tr key={item.id}>
              <td className="max-w-md">
                <Link
                  href={`/admin/testimonials/${item.id}`}
                  className="line-clamp-2 font-semibold text-violet-700 hover:underline"
                >
                  {item.quote}
                </Link>
              </td>
              <td>{item.author}</td>
              <td>{item.sortOrder}</td>
              <td>
                <Badge value={item.visible ? "visible" : "hidden"} />
              </td>
            </tr>
          ))}
        </Table>
      )}
    </>
  );
}
