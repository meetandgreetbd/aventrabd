import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { Badge, Card, PageTitle, parseId } from "@/components/admin/ui";
import { getDb, schema } from "@/db";
import { requireUser } from "@/lib/auth";
import { formatDateTime } from "@/lib/format";
import { deleteApplication, setApplicationStatus } from "@/server/actions/jobs";

export const metadata = { title: "Application" };

const statuses = ["new", "reviewed", "shortlisted", "rejected"] as const;

export default async function ApplicationPage({ params }: { params: Promise<{ id: string }> }) {
  await requireUser();
  const id = parseId((await params).id);
  if (id === null) notFound();
  const row = (
    await getDb()
      .select({ application: schema.applications, jobTitle: schema.jobs.title })
      .from(schema.applications)
      .innerJoin(schema.jobs, eq(schema.jobs.id, schema.applications.jobId))
      .where(eq(schema.applications.id, id))
      .limit(1)
  )[0];
  if (!row) notFound();
  const { application, jobTitle } = row;

  return (
    <>
      <PageTitle
        title={application.name}
        description={`Applied for ${jobTitle} on ${formatDateTime(application.createdAt)}`}
        back={{ href: "/admin/applications", label: "Applications" }}
      />
      <div className="space-y-5">
        <Card title="Applicant">
          <dl className="grid gap-4 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-slate-500">Email</dt>
              <dd>
                <a href={`mailto:${application.email}`} className="font-semibold text-violet-700 hover:underline">
                  {application.email}
                </a>
              </dd>
            </div>
            <div>
              <dt className="text-slate-500">Phone</dt>
              <dd className="font-semibold">{application.phone || "—"}</dd>
            </div>
            <div>
              <dt className="text-slate-500">CV</dt>
              <dd>
                <a
                  href={`/admin/files/${application.id}`}
                  className="font-semibold text-violet-700 hover:underline"
                >
                  Download {application.cvName}
                </a>
              </dd>
            </div>
            <div>
              <dt className="text-slate-500">Current status</dt>
              <dd>
                <Badge value={application.status} />
              </dd>
            </div>
          </dl>
          {application.coverNote && (
            <div>
              <h3 className="text-sm text-slate-500">Cover note</h3>
              <p className="mt-1 whitespace-pre-line text-sm leading-relaxed">{application.coverNote}</p>
            </div>
          )}
        </Card>

        <Card title="Update status">
          <form action={setApplicationStatus.bind(null, application.id)} className="flex flex-wrap items-end gap-3">
            <label className="text-sm font-semibold text-slate-800">
              Status
              <select
                name="status"
                defaultValue={application.status}
                className="mt-1.5 block rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm capitalize"
              >
                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="submit"
              className="rounded-lg bg-violet-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-violet-800"
            >
              Save status
            </button>
          </form>
        </Card>

        <div className="flex items-center justify-between gap-4 rounded-xl border border-red-200 bg-white p-5">
          <p className="text-sm text-slate-600">Deleting an application also deletes the CV file.</p>
          <ConfirmButton action={deleteApplication.bind(null, application.id)} label="Delete application" />
        </div>
      </div>
    </>
  );
}
