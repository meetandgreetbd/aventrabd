import { PageHero } from "@/components/sections/PageHero";
import { ButtonLink, Container } from "@/components/ui";
import { Reveal } from "@/components/ui/Reveal";
import { getPage } from "@/lib/cms";
import { pageMetadata } from "@/lib/seo";

export const generateMetadata = () => pageMetadata("about");

export default async function AboutPage() {
  const { content } = await getPage("about");
  return (
    <div className="backdrop-light overflow-hidden pb-24">
      <PageHero
        eyebrow={content.eyebrow}
        title={content.title}
        text={content.text}
        cta={{ label: content.cta, href: "#mission" }}
        art="rings"
      />

      <section className="py-10" aria-label="Aventra in numbers">
        <Container>
          <Reveal>
            <dl className="glass grid divide-y divide-violet-200/70 rounded-3xl sm:grid-cols-3 sm:divide-x sm:divide-y-0">
              {content.stats.map((stat) => (
                <div key={stat.label} className="flex flex-col-reverse px-6 py-8 text-center">
                  <dt className="mt-2 text-sm font-medium text-ink-soft">{stat.label}</dt>
                  <dd className="text-4xl font-bold tracking-tight text-ink sm:text-5xl">{stat.value}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </Container>
      </section>

      <section id="mission" className="pt-12">
        <Container>
          <Reveal className="max-w-2xl">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">{content.missionTitle}</h2>
            <p className="mt-4 text-lg leading-relaxed text-ink-soft">{content.missionText}</p>
            <ButtonLink href="/culture" className="mt-7">
              {content.missionCta}
            </ButtonLink>
          </Reveal>
        </Container>
      </section>
    </div>
  );
}
