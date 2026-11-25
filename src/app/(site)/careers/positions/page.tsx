import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { JobList } from "@/components/careers/JobList";
import { RefPage, u } from "@/components/ref";
import { getOpenJobs, getPage, getSettings } from "@/lib/cms";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  return {
    title: "Open Positions",
    description: "Current job openings at Aventra.",
    alternates: { canonical: "/careers/positions" },
    robots: settings.siteNoindex ? { index: false, follow: false } : undefined,
  };
}

/** The live list of jobs from the admin on a page of its own (the Careers page shows it too). */
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
        <JobList jobs={jobs} emptyText={content.jobsEmpty} />
      </section>
    </RefPage>
  );
}
