import { Check } from "lucide-react";
import { RefBanner, RefFeatures, RefHero, RefPage, RefSections, u } from "@/components/ref";
import { pageFaqs, pageSections } from "@/lib/content";
import { getPage } from "@/lib/cms";
import { pageMetadata } from "@/lib/seo";

export const generateMetadata = () => pageMetadata("learning");

// All numbers below are measurements from the design, in design units (see components/ref).
export default async function LearningPage() {
  const { content } = await getPage("learning");
  return (
    <RefPage>

      <RefHero
        art={{ name: "cubes", x: 234, y: 61, w: 172 }}
        top={88}
        eyebrow={content.eyebrow}
        title={content.title}
        text={content.text}
        cta={{ label: content.cta, href: "#programs" }}
      />

      <section id="programs" style={{ marginTop: u(8) }}>
        <h2 className="ref-h2" style={{ fontSize: `max(22px, ${u(13.5)})` }}>
          {content.listTitle}
        </h2>
        <ul style={{ marginTop: u(8) }}>
          {content.list.map((item) => (
            <li key={item} className="ref-body flex items-center font-medium" style={{ gap: u(9), marginTop: u(8) }}>
              <span
                className="flex shrink-0 items-center justify-center rounded-full bg-brand text-white"
                style={{ width: `max(22px, ${u(14)})`, height: `max(22px, ${u(14)})` }}
              >
                <Check style={{ width: "58%", height: "58%" }} strokeWidth={3.2} />
              </span>
              {item}
            </li>
          ))}
        </ul>
      </section>

      <RefFeatures {...content.more} />

      <RefSections sections={pageSections.learning} faq={pageFaqs.learning} />

      <RefBanner top={24} text={content.bannerText} href="/careers" />
    </RefPage>
  );
}
