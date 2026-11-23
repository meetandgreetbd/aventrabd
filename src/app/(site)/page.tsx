import Link from "next/link";
import { ArrowRight, Lightbulb, Play, Sprout, Star, Users } from "lucide-react";
import { ButtonLink, Container, Eyebrow, IconCard, safeHref } from "@/components/ui";
import { Reveal } from "@/components/ui/Reveal";
import { Art, CrystalA } from "@/components/visuals";
import { getPage } from "@/lib/cms";
import { pageMetadata } from "@/lib/seo";

export const generateMetadata = () => pageMetadata("home");

const valueIcons = [Lightbulb, Users, Sprout, Star];

export default async function HomePage() {
  const { content } = await getPage("home");
  return (
    <div className="backdrop-dark overflow-hidden text-white">
      <section className="pt-32 pb-12 sm:pt-40">
        <Container className="grid items-center gap-10 lg:grid-cols-[1.1fr_1fr]">
          <Reveal>
            <Eyebrow dark>{content.eyebrow}</Eyebrow>
            <h1 className="mt-5 text-4xl font-bold leading-[1.06] tracking-tight sm:text-6xl lg:text-[4.1rem]">
              {content.titleLead} <span className="text-gradient">{content.titleAccent}</span>
            </h1>
            <p className="mt-6 max-w-md text-base leading-relaxed text-white/70 sm:text-lg">
              {content.text}
            </p>
            <div className="mt-9 flex flex-wrap gap-4">
              <ButtonLink href="/about">{content.primaryCta}</ButtonLink>
              <ButtonLink
                href={safeHref(content.secondaryCtaUrl, "/about")}
                variant="ghost-dark"
                icon={
                  <span className="flex h-6 w-6 items-center justify-center rounded-full border border-white/50">
                    <Play className="h-3 w-3 fill-current" />
                  </span>
                }
              >
                {content.secondaryCta}
              </ButtonLink>
            </div>
          </Reveal>
          <Reveal delay={0.15} className="order-first lg:order-none">
            <div className="mx-auto w-3/5 lg:w-[125%] lg:translate-x-[6%]">
              <CrystalA />
            </div>
          </Reveal>
        </Container>
      </section>

      <section className="py-10">
        <Container>
          <ul className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {content.values.map((value, index) => (
              <li key={value}>
                <Reveal delay={index * 0.08} className="h-full">
                  <IconCard icon={valueIcons[index % valueIcons.length]} title={value} dark />
                </Reveal>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <section className="relative pt-14 pb-28 lg:pb-36">
        {/* The globe rises from the bottom-right corner and is cropped by the page edge, as in the design. */}
        <Art name="globe" className="absolute right-0 bottom-0 w-[26rem] opacity-70 lg:w-[46rem] lg:opacity-100" />
        <Container className="relative">
          <Reveal>
            <h2 className="max-w-md text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
              {content.sectionTitle}
            </h2>
            <p className="mt-5 max-w-md leading-relaxed text-white/70">{content.sectionText}</p>
            <Link
              href="/culture"
              className="group mt-7 inline-flex items-center gap-2 font-semibold text-violet-300 transition hover:text-violet-200"
            >
              {content.sectionCta}
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
            </Link>
          </Reveal>
        </Container>
      </section>
    </div>
  );
}
