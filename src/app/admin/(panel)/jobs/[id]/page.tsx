import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { Card, Field, PageTitle, SeoFields, Select, TextArea, parseId } from "@/components/admin/ui";
import { ActionForm } from "@/components/forms/ActionForm";
import { getDb, schema } from "@/db";
import { requireUser } from "@/lib/auth";
import { deleteJob, saveJob } from "@/server/actions/jobs";

export const metadata = { title: "Job post" };

export default async function JobEditPage({ params }: { params: Promise<{ id: string }> }) {
  await requireUser();
  const id = parseId((await params).id);
  const job =
    id === null
      ? undefined
      : (await getDb().select().from(schema.jobs).where(eq(schema.jobs.id, id)).limit(1))[0];
  if (id !== null && !job) notFound();

  return (
    <>
      <PageTitle
        title={job ? job.title : "New job post"}
        back={{ href: "/admin/jobs", label: "Job posts" }}
        action={
          job && job.status !== "draft"
            ? { href: `/careers/${job.slug}`, label: "View on site" }
            : undefined
        }
      />
      <ActionForm action={saveJob.bind(null, id)} submitLabel="Save job post" variant="admin" className="space-y-5">
        <Card title="Details">
          <Field label="Job title" name="title" required defaultValue={job?.title} maxLength={160} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Department" name="department" defaultValue={job?.department} maxLength={120} />
            <Field label="Location" name="location" defaultValue={job?.location} maxLength={120} />
            <Select
              label="Job type"
              name="type"
              defaultValue={job?.type ?? "full-time"}
              options={[
                { value: "full-time", label: "Full-time" },
                { value: "part-time", label: "Part-time" },
                { value: "contract", label: "Contract" },
                { value: "internship", label: "Internship" },
              ]}
            />
            <Field
              label="Application deadline"
              name="deadline"
              type="date"
              defaultValue={job?.deadline ?? ""}
              hint="Optional. Applications close at the end of this day."
            />
          </div>
          <TextArea
            label="Short summary"
            name="summary"
            rows={2}
            maxLength={300}
            defaultValue={job?.summary}
            hint="One or two sentences shown in the job list."
          />
          <TextArea
            label="Description"
            name="description"
            rows={10}
            required
            defaultValue={job?.description}
            hint="Leave an empty line between paragraphs."
          />
          <TextArea
            label="Requirements"
            name="requirements"
            rows={6}
            defaultValue={job?.requirements}
            hint="One requirement per line; each line becomes a bullet point."
          />
        </Card>

        <Card title="Publishing">
          <Select
            label="Status"
            name="status"
            defaultValue={job?.status ?? "draft"}
            hint="Draft: hidden. Open: listed and accepting applications. Closed: page stays reachable by link but applications are off."
            options={[
              { value: "draft", label: "Draft" },
              { value: "open", label: "Open" },
              { value: "closed", label: "Closed" },
            ]}
          />
          <Field
            label="URL slug"
            name="slug"
            defaultValue={job?.slug}
            maxLength={160}
            hint="The last part of the page address. Leave empty to create it from the title."
          />
        </Card>

        <SeoFields
          seoTitle={job?.seoTitle ?? ""}
          seoDescription={job?.seoDescription ?? ""}
          noindex={job?.noindex ?? false}
          fallbackTitle="Job title — Careers | Aventra"
        />
      </ActionForm>

      {job && (
        <div className="mt-8 flex items-center justify-between gap-4 rounded-xl border border-red-200 bg-white p-5">
          <p className="text-sm text-slate-600">
            Deleting a job post also deletes its applications and their CV files.
          </p>
          <ConfirmButton action={deleteJob.bind(null, job.id)} label="Delete job post" />
        </div>
      )}
    </>
  );
}
