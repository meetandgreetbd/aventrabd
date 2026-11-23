import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Briefcase, CalendarDays, Check, MapPin } from "lucide-react";
import { ActionForm } from "@/components/forms/ActionForm";
import { Honeypot, SiteField } from "@/components/forms/SiteFields";
import { Container, Eyebrow } from "@/components/ui";
import { getPublicJob, isJobAcceptingApplications } from "@/lib/cms";
import { formatDate, jobTypeLabel, lines, paragraphs } from "@/lib/format";
import { buildMetadata } from "@/lib/seo";
import { applyToJob } from "@/server/actions/public";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const job = await getPublicJob(slug);
  if (!job) return { title: "Position not found", robots: { index: false, follow: false } };
  return buildMetadata({
    seo: {
      seoTitle: job.seoTitle,
      seoDescription: job.seoDescription,
      // A closed role should drop out of search results even if nobody ticks the box.
      noindex: job.noindex || job.status !== "open",
    },
    fallbackTitle: `${job.title} — Careers`,
    fallbackDescription: job.summary || `Apply for the ${job.title} position at Aventra.`,
    path: `/careers/${job.slug}`,
  });
}

export default async function JobPage({ params }: Props) {
  const { slug } = await params;
  const job = await getPublicJob(slug);
  if (!job) notFound();
  const accepting = isJobAcceptingApplications(job);
  const requirements = lines(job.requirements);

  return (
    <div className="backdrop-light pt-32 pb-24 sm:pt-36">
      <Container>
        <Link
          href="/careers/positions"
          className="inline-flex items-center gap-2 text-sm font-semibold text-brand hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          All open positions
        </Link>

        <div className="mt-6 grid gap-10 lg:grid-cols-[1.3fr_1fr]">
          <article>
            <Eyebrow>{job.department || "Careers"}</Eyebrow>
            <h1 className="mt-3 text-4xl font-bold leading-tight tracking-tight sm:text-5xl">{job.title}</h1>
            <ul className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm text-ink-soft">
              <li className="flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-brand" />
                {jobTypeLabel(job.type)}
              </li>
              {job.location && (
                <li className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-brand" />
                  {job.location}
                </li>
              )}
              {job.deadline && (
                <li className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-brand" />
                  Apply by {formatDate(job.deadline)}
                </li>
              )}
            </ul>

            <h2 className="mt-10 text-2xl font-bold">About the role</h2>
            <div className="mt-4 space-y-4 leading-relaxed text-ink-soft">
              {paragraphs(job.description).map((block, index) => (
                <p key={index} className="whitespace-pre-line">
                  {block}
                </p>
              ))}
            </div>

            {requirements.length > 0 && (
              <>
                <h2 className="mt-10 text-2xl font-bold">What we are looking for</h2>
                <ul className="mt-4 space-y-3">
                  {requirements.map((item, index) => (
                    <li key={index} className="flex gap-3 text-ink-soft">
                      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-pale text-brand">
                        <Check className="h-3.5 w-3.5" strokeWidth={3} />
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </article>

          <aside className="lg:sticky lg:top-28 lg:self-start">
            <div className="glass rounded-3xl p-6 sm:p-8">
              <h2 className="text-2xl font-bold">Apply for this role</h2>
              {accepting ? (
                <ActionForm
                  action={applyToJob.bind(null, job.id)}
                  submitLabel="Submit Application"
                  className="mt-6 space-y-5"
                  replaceOnSuccess
                >
                  <SiteField label="Full Name" name="name" required autoComplete="name" />
                  <SiteField label="Email" name="email" type="email" required autoComplete="email" />
                  <SiteField label="Phone" name="phone" type="tel" required autoComplete="tel" />
                  <SiteField
                    label="CV / Resume"
                    name="cv"
                    type="file"
                    required
                    accept=".pdf,.doc,.docx"
                    hint="PDF, DOC or DOCX, up to 5 MB."
                  />
                  <SiteField label="Cover Note (optional)" name="coverNote" rows={4} />
                  <Honeypot />
                </ActionForm>
              ) : (
                <p className="mt-4 leading-relaxed text-ink-soft">
                  This position is no longer accepting applications. Take a look at our{" "}
                  <Link href="/careers/positions" className="font-semibold text-brand hover:underline">
                    other open positions
                  </Link>
                  .
                </p>
              )}
            </div>
          </aside>
        </div>
      </Container>
    </div>
  );
}
