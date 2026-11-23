import { RefCorner, RefFeatures, RefHero, RefPage, RefSection, RefSections, u } from "@/components/ref";
import { pageFaqs, pageSections } from "@/lib/content";
import { getPage } from "@/lib/cms";
import { pageMetadata } from "@/lib/seo";

export const generateMetadata = () => pageMetadata("about");

// All numbers below are measurements from the design, in design units (see components/ref).
export default async function AboutPage() {
  const { content } = await getPage("about");
  return (
    <RefPage>
      <RefCorner name="arcs" />

      <RefHero
        art={{ name: "rings", x: 226, y: 57, w: 215 }}
        top={112}
        eyebrow={content.eyebrow}
        title={content.title}
        text={content.text}
        cta={{ label: content.cta, href: "#mission" }}
      />

      <dl
        className="glass ref-panel grid grid-cols-3"
        style={{ marginTop: u(10), minHeight: u(80) }}
        aria-label="Aventra in numbers"
      >
        {content.stats.map((stat, index) => (
          <div
            key={stat.label}
            className={`flex flex-col-reverse items-center justify-center text-center ${index > 0 ? "border-l border-ink/10" : ""}`}
            style={{ padding: `${u(10)} ${u(4)}` }}
          >
            <dt className="ref-stat-label">{stat.label}</dt>
            <dd className="ref-stat-value">{stat.value}</dd>
          </div>
        ))}
      </dl>

      <RefFeatures {...content.more} />

      <RefSections sections={pageSections.about} faq={pageFaqs.about} />

      <RefSection
        id="mission"
        top={36}
        title={content.missionTitle}
        text={content.missionText}
        cta={{ label: content.missionCta, href: "/culture" }}
      />

    </RefPage>
  );
}
