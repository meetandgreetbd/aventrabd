import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Briefcase, MapPin } from "lucide-react";
import { RefPage, u } from "@/components/ref";
import { getOpenJobs, getPage, getSettings } from "@/lib/cms";
import { jobTypeLabel } from "@/lib/format";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  return {
    title: "Open Positions",
    description: "Current job openings at Aventra.",
    alternates: { canonical: "/careers/positions" },
    robots: settings.siteNoindex ? { index: false, follow: false } : undefined,
  };
}

/**
 * The live list of jobs from the admin. It has its own page so that the Careers
 * page itself can end with the banner, exactly as in the design.
 */
export default async function PositionsPage() {
  const [{ content }, jobs] = await Promise.all([getPage("careers"), getOpenJobs()]);
  return (
    <RefPage>
      <section style={{ paddingTop: u(88) }}>
        <Link href="/careers" className="ref-small inline-flex items-center gap-2 font-bold text-brand hover:underline">
          <ArrowLeft className="h-4 w-4" />
          Careers
        </Link>
        <h1 className="ref-h1">{content.jobsTitle}</h1>

        {jobs.length === 0 ? (
          <p className="glass ref-panel ref-text text-center" style={{ marginTop: u(16), padding: u(18) }}>
            {content.jobsEmpty}
          </p>
        ) : (
          <ul style={{ marginTop: u(12) }}>
            {jobs.map((job) => (
              <li key={job.id} style={{ marginTop: u(5) }}>
                <Link
                  href={`/careers/${job.slug}`}
                  className="glass ref-panel group flex flex-col gap-3 transition duration-300 hover:-translate-y-1 sm:flex-row sm:items-center"
                  style={{ padding: `${u(10)} ${u(12)}` }}
                >
                  <div className="flex-1">
                    <h2 className="ref-banner-text">{job.title}</h2>
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
        )}
      </section>
    </RefPage>
  );
}
