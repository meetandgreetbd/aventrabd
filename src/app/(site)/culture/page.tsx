import { BookOpen, HeartPulse, TrendingUp, Users } from "lucide-react";
import { PageHero } from "@/components/sections/PageHero";
import { ButtonLink, Container, IconCard } from "@/components/ui";
import { Reveal } from "@/components/ui/Reveal";
import { getPage } from "@/lib/cms";
import { pageMetadata } from "@/lib/seo";

export const generateMetadata = () => pageMetadata("culture");

const icons = [Users, BookOpen, TrendingUp, HeartPulse];

export default async function CulturePage() {
  const { content } = await getPage("culture");
  return (
    <div className="backdrop-light overflow-hidden pb-24">
      <PageHero
        eyebrow={content.eyebrow}
        title={content.title}
        text={content.text}
        cta={{ label: content.cta, href: "/life" }}
        art="network"
      />

      <section className="py-10">
        <Container>
          <ul className="grid grid-cols-2 gap-4 lg:grid-cols-4">
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

      <section className="pt-12">
        <Container>
          <Reveal className="max-w-2xl">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">{content.sectionTitle}</h2>
            <p className="mt-4 text-lg leading-relaxed text-ink-soft">{content.sectionText}</p>
            <ButtonLink href="/leadership" className="mt-7">
              {content.sectionCta}
            </ButtonLink>
          </Reveal>
        </Container>
      </section>
    </div>
  );
}
