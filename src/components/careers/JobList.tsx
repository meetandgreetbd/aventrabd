import Link from "next/link";
import { ArrowRight, Briefcase, MapPin } from "lucide-react";
import { u } from "@/components/ref";
import type { getOpenJobs } from "@/lib/cms";
import { jobTypeLabel } from "@/lib/format";

type Job = Awaited<ReturnType<typeof getOpenJobs>>[number];

/** The open jobs from the admin, shown on the Careers page and on /careers/positions. */
export function JobList({ jobs, emptyText }: { jobs: Job[]; emptyText: string }) {
  if (jobs.length === 0) {
    return (
      <p className="glass ref-panel ref-text text-center" style={{ marginTop: u(16), padding: u(18) }}>
        {emptyText}
      </p>
    );
  }
  return (
    <ul style={{ marginTop: u(12) }}>
      {jobs.map((job) => (
        <li key={job.id} style={{ marginTop: u(5) }}>
          <Link
            href={`/careers/${job.slug}`}
            className="glass ref-panel group flex flex-col gap-3 transition duration-300 hover:-translate-y-1 sm:flex-row sm:items-center"
            style={{ padding: `${u(10)} ${u(12)}` }}
          >
            <div className="flex-1">
              <h3 className="ref-banner-text">{job.title}</h3>
              {job.summary && <p className="ref-small mt-1.5 text-ink-soft">{job.summary}</p>}
              <ul className="ref-small mt-2.5 flex flex-wrap gap-x-5 gap-y-1.5 text-ink-soft">
                {job.department && (
                  <li className="flex items-center gap-1.5">
                    <Briefcase className="h-4 w-4 text-brand" />
                    {job.department}
                  </li>
                )}
                {job.location && (
                  <li className="flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-brand" />
                    {job.location}
                  </li>
                )}
                <li className="rounded-full bg-brand-pale px-3 py-0.5 font-semibold text-brand">
                  {jobTypeLabel(job.type)}
                </li>
              </ul>
            </div>
            <span className="ref-small inline-flex items-center gap-2 font-bold text-brand">
              View &amp; apply
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
