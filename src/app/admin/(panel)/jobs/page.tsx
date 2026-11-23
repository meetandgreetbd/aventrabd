import Link from "next/link";
import { count, desc, eq } from "drizzle-orm";
import { Badge, Empty, PageTitle, RowActions, Table } from "@/components/admin/ui";
import { getDb, schema } from "@/db";
import { requireUser } from "@/lib/auth";
import { deleteJob } from "@/server/actions/jobs";
import { formatDate, jobTypeLabel } from "@/lib/format";

export const metadata = { title: "Job posts" };

export default async function JobsPage() {
  await requireUser();
  const rows = await getDb()
    .select({
      id: schema.jobs.id,
      title: schema.jobs.title,
      slug: schema.jobs.slug,
      type: schema.jobs.type,
      status: schema.jobs.status,
      deadline: schema.jobs.deadline,
      applications: count(schema.applications.id),
    })
    .from(schema.jobs)
    .leftJoin(schema.applications, eq(schema.applications.jobId, schema.jobs.id))
    .groupBy(schema.jobs.id)
    .orderBy(desc(schema.jobs.createdAt));

  return (
    <>
      <PageTitle
        title="Job posts"
        description="Only posts with status Open appear on the Careers page."
        action={{ href: "/admin/jobs/new", label: "New job post" }}
      />
      {rows.length === 0 ? (
        <Empty>No job posts yet. Create the first one.</Empty>
      ) : (
        <Table head={["Title", "Type", "Status", "Deadline", "Applications", "Actions"]}>
          {rows.map((job) => (
            <tr key={job.id}>
              <td>
                <Link href={`/admin/jobs/${job.id}`} className="font-semibold text-brand hover:underline">
                  {job.title}
                </Link>
              </td>
              <td>{jobTypeLabel(job.type)}</td>
              <td>
                <Badge value={job.status} />
              </td>
              <td>{job.deadline ? formatDate(job.deadline) : "—"}</td>
              <td>
                <Link href={`/admin/applications?job=${job.id}`} className="text-brand hover:underline">
                  {job.applications}
                </Link>
              </td>
              <td>
                <RowActions
                  view={job.status === "draft" ? undefined : { href: `/careers/${job.slug}`, newTab: true }}
                  edit={`/admin/jobs/${job.id}`}
                  onDelete={deleteJob.bind(null, job.id)}
                />
              </td>
            </tr>
          ))}
        </Table>
      )}
    </>
  );
}
