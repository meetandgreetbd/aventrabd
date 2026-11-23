import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { Badge, Empty, PageTitle, Table } from "@/components/admin/ui";
import { getDb, schema } from "@/db";
import { requireUser } from "@/lib/auth";
import { formatDateTime } from "@/lib/format";

export const metadata = { title: "Applications" };

export default async function ApplicationsPage({
  searchParams,
}: {
  searchParams: Promise<{ job?: string }>;
}) {
  await requireUser();
  const jobParam = (await searchParams).job ?? "";
  const jobId = /^\d{1,9}$/.test(jobParam) ? Number(jobParam) : null;

  const db = getDb();
  const query = db
    .select({
      id: schema.applications.id,
      name: schema.applications.name,
      email: schema.applications.email,
      status: schema.applications.status,
      createdAt: schema.applications.createdAt,
      jobTitle: schema.jobs.title,
    })
    .from(schema.applications)
    .innerJoin(schema.jobs, eq(schema.jobs.id, schema.applications.jobId))
    .orderBy(desc(schema.applications.createdAt))
    .limit(500);
  const rows = await (jobId === null ? query : query.where(eq(schema.applications.jobId, jobId)));
  const filteredJob = jobId === null ? undefined : rows[0]?.jobTitle;

  return (
    <>
      <PageTitle
        title="Applications"
        description={
          jobId === null
            ? "Everyone who applied through the website, newest first."
            : `Showing applications for ${filteredJob ?? "the selected job"}.`
        }
        back={jobId === null ? undefined : { href: "/admin/applications", label: "All applications" }}
      />
      {rows.length === 0 ? (
        <Empty>No applications yet.</Empty>
      ) : (
        <Table head={["Applicant", "Job", "Status", "Received"]}>
          {rows.map((row) => (
            <tr key={row.id}>
              <td>
                <Link
                  href={`/admin/applications/${row.id}`}
                  className="font-semibold text-violet-700 hover:underline"
                >
                  {row.name}
                </Link>
                <div className="text-xs text-slate-500">{row.email}</div>
              </td>
              <td>{row.jobTitle}</td>
              <td>
                <Badge value={row.status} />
              </td>
              <td>{formatDateTime(row.createdAt)}</td>
            </tr>
          ))}
        </Table>
      )}
    </>
  );
}
