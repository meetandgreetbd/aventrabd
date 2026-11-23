import { Check } from "lucide-react";
import { PageHero } from "@/components/sections/PageHero";
import { Container, CtaBanner } from "@/components/ui";
import { Reveal } from "@/components/ui/Reveal";
import { getPage } from "@/lib/cms";
import { pageMetadata } from "@/lib/seo";

export const generateMetadata = () => pageMetadata("learning");

export default async function LearningPage() {
  const { content } = await getPage("learning");
  return (
    <div className="backdrop-light overflow-hidden pb-24">
      <PageHero
        eyebrow={content.eyebrow}
        title={content.title}
        text={content.text}
        cta={{ label: content.cta, href: "#programs" }}
        art="cubes"
      />

      <section id="programs" className="py-10">
        <Container>
          <Reveal>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">{content.listTitle}</h2>
          </Reveal>
          <ul className="mt-7 grid gap-4 sm:grid-cols-2">
            {content.list.map((item, index) => (
              <li key={item}>
                <Reveal delay={index * 0.06}>
                  <div className="glass flex items-center gap-4 rounded-2xl px-5 py-4">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand text-white">
                      <Check className="h-4 w-4" strokeWidth={3} />
                    </span>
                    <span className="font-medium">{item}</span>
                  </div>
                </Reveal>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <section className="pt-8">
        <Container>
          <Reveal>
            <CtaBanner text={content.bannerText} href="/careers" />
          </Reveal>
        </Container>
      </section>
    </div>
  );
}
