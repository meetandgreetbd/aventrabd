import { BookHeart, Heart, Quote, UsersRound } from "lucide-react";
import { RefCards, RefFeatures, RefHero, RefPage, RefSections, RefSwirl, u } from "@/components/ref";
import { pageFaqs, pageSections } from "@/lib/content";
import { getPage, getTestimonials } from "@/lib/cms";
import { pageMetadata } from "@/lib/seo";

export const generateMetadata = () => pageMetadata("life");

const icons = [UsersRound, Heart, BookHeart];

// All numbers below are measurements from the design, in design units (see components/ref).
export default async function LifePage() {
  const [{ content }, testimonials] = await Promise.all([getPage("life"), getTestimonials()]);
  return (
    <RefPage>
      <RefSwirl />

      <RefHero
        art={{ name: "loops", x: 227, y: 55, w: 215 }}
        top={88}
        eyebrow={content.eyebrow}
        title={content.title}
        text={content.text}
        cta={{ label: content.cta, href: "#life" }}
        textWidth={185}
      />

      <div id="life">
        <RefCards top={10} items={content.cards} icons={icons} />
      </div>

      <RefFeatures {...content.more} />

      <RefSections sections={pageSections.life} faq={pageFaqs.life} />

      {testimonials.map((item) => (
        <figure
          key={item.id}
          className="glass ref-panel flex"
          style={{ marginTop: u(11), padding: `${u(17)} ${u(14)}`, gap: u(11) }}
        >
          <Quote
            className="shrink-0 fill-brand-deep text-brand-deep"
            style={{ width: u(24), height: u(24) }}
            aria-hidden="true"
          />
          <div>
            <blockquote className="ref-body font-medium text-ink" style={{ maxWidth: u(140), lineHeight: 1.55 }}>
              {item.quote}”
            </blockquote>
            <figcaption className="ref-small text-ink-soft" style={{ marginTop: u(7) }}>
              — {item.author}
              {item.role && `, ${item.role}`}
            </figcaption>
          </div>
        </figure>
      ))}

    </RefPage>
  );
}
