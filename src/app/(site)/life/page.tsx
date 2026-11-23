import { CalendarDays, Globe2, Heart, Quote } from "lucide-react";
import { PageHero } from "@/components/sections/PageHero";
import { Container, IconCard } from "@/components/ui";
import { Reveal } from "@/components/ui/Reveal";
import { getPage, getTestimonials } from "@/lib/cms";
import { pageMetadata } from "@/lib/seo";

export const generateMetadata = () => pageMetadata("life");

const icons = [CalendarDays, Heart, Globe2];

export default async function LifePage() {
  const [{ content }, testimonials] = await Promise.all([getPage("life"), getTestimonials()]);
  return (
    <div className="backdrop-light overflow-hidden pb-24">
      <PageHero
        eyebrow={content.eyebrow}
        title={content.title}
        text={content.text}
        cta={{ label: content.cta, href: "#life" }}
        art="loops"
      />

      <section id="life" className="py-10">
        <Container>
          <ul className="grid gap-4 sm:grid-cols-3">
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

      {testimonials.length > 0 && (
        <section className="pt-6" aria-label="What our people say">
          <Container>
            <ul className={`grid gap-5 ${testimonials.length > 1 ? "md:grid-cols-2" : ""}`}>
              {testimonials.map((item, index) => (
                <li key={item.id}>
                  <Reveal delay={index * 0.08} className="h-full">
                    <figure className="glass flex h-full gap-5 rounded-3xl p-7 sm:p-9">
                      <Quote className="h-10 w-10 shrink-0 fill-brand text-brand" aria-hidden="true" />
                      <div>
                        <blockquote className="text-lg font-medium leading-relaxed text-ink">
                          “{item.quote}”
                        </blockquote>
                        <figcaption className="mt-4 text-sm text-ink-soft">
                          — {item.author}
                          {item.role && `, ${item.role}`}
                        </figcaption>
                      </div>
                    </figure>
                  </Reveal>
                </li>
              ))}
            </ul>
          </Container>
        </section>
      )}
    </div>
  );
}
