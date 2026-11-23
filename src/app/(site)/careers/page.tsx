import Link from "next/link";
import { ArrowRight, Briefcase, Gem, MapPin, Rocket, Scale, Users } from "lucide-react";
import { PageHero } from "@/components/sections/PageHero";
import { Container, CtaBanner, IconCard } from "@/components/ui";
import { Reveal } from "@/components/ui/Reveal";
import { getOpenJobs, getPage } from "@/lib/cms";
import { jobTypeLabel } from "@/lib/format";
import { pageMetadata } from "@/lib/seo";

export const generateMetadata = () => pageMetadata("careers");

const icons = [Rocket, Users, Gem, Scale];

export default async function CareersPage() {
  const [{ content }, jobs] = await Promise.all([getPage("careers"), getOpenJobs()]);
  return (
    <div className="backdrop-light overflow-hidden pb-24">
      <PageHero
        eyebrow={content.eyebrow}
        title={content.title}
        text={content.text}
        cta={{ label: content.cta, href: "#open-positions" }}
        art="bars"
      />

      <section className="py-10">
        <Container>
          <Reveal>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">{content.whyTitle}</h2>
          </Reveal>
          <ul className="mt-7 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {content.cards.map((card, index) => (
              <li key={card}>
                <Reveal delay={index * 0.08} className="h-full">
                  <IconCard icon={icons[index % icons.length]} title={card} />
                </Reveal>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <section id="open-positions" className="py-10">
        <Container>
          <Reveal>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">{content.jobsTitle}</h2>
          </Reveal>
          {jobs.length === 0 ? (
            <Reveal>
              <p className="glass mt-7 rounded-3xl px-6 py-10 text-center text-ink-soft">
                {content.jobsEmpty}
              </p>
            </Reveal>
          ) : (
            <ul className="mt-7 space-y-4">
              {jobs.map((job, index) => (
                <li key={job.id}>
                  <Reveal delay={Math.min(index, 5) * 0.06}>
                    <Link
                      href={`/careers/${job.slug}`}
                      className="glass group flex flex-col gap-4 rounded-3xl px-6 py-6 transition duration-300 hover:-translate-y-1 sm:flex-row sm:items-center sm:px-8"
                    >
                      <div className="flex-1">
                        <h3 className="text-xl font-bold">{job.title}</h3>
                        {job.summary && <p className="mt-1.5 text-sm text-ink-soft">{job.summary}</p>}
                        <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-ink-soft">
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
                          <li className="rounded-full bg-violet-100 px-3 py-0.5 font-semibold text-brand">
                            {jobTypeLabel(job.type)}
                          </li>
                        </ul>
                      </div>
                      <span className="inline-flex items-center gap-2 text-sm font-semibold text-brand">
                        View &amp; apply
                        <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                      </span>
                    </Link>
                  </Reveal>
                </li>
              ))}
            </ul>
          )}
        </Container>
      </section>

      <section className="pt-8">
        <Container>
          <Reveal>
            <CtaBanner text={content.bannerText} href="/contact" dark />
          </Reveal>
        </Container>
      </section>
    </div>
  );
}
