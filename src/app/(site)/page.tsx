import type { CSSProperties } from "react";
import Link from "next/link";
import { ArrowRight, Lightbulb, Play, Sprout, Star, Users } from "lucide-react";
import { RefButton, RefCards, RefCorner, RefFeatures, RefPage, RefSections, u } from "@/components/ref";
import { safeHref } from "@/components/ui";
import { pageFaqs, pageSections } from "@/lib/content";
import { getPage } from "@/lib/cms";
import { pageMetadata } from "@/lib/seo";
import sizes from "../../../public/art/sizes.json";

export const generateMetadata = () => pageMetadata("home");

const valueIcons = [Lightbulb, Users, Sprout, Star];

// All numbers below are measurements from the design, in design units (see components/ref).
export default async function HomePage() {
  const { content } = await getPage("home");
  // The design breaks the headline as "Building a / Smarter, / Stronger Tomorrow":
  // the last word of the lead stays on one line with the highlighted word.
  const words = content.titleLead.split(" ");
  const lastWord = words.pop();

  return (
    <RefPage dark bottom={22}>
      <RefCorner name="globe" />

      {/* One full screen: headline on the left, the glowing "A" beside it. */}
      <section className="ref-hero" style={{ "--x": 226, "--aw": 150, "--ratio": 0.89 } as CSSProperties}>
        {/* The crystal "A" from the design (completed by AI), a small gap to the right of the headline. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`/art/a.webp?v=${sizes.a.v}`}
          alt=""
          aria-hidden="true"
          width={sizes.a.width}
          height={sizes.a.height}
          className="ref-art home-a"
        />
        <p className="ref-eyebrow" style={{ color: "rgb(255 255 255 / 0.82)", fontSize: `max(11px, ${u(7.6)})` }}>
          {content.eyebrow}
        </p>
        <h1 className="ref-h1" style={{ color: "#fff", fontSize: `max(36px, ${u(25)})` }}>
          <span className="block" style={{ maxWidth: u(160) }}>
            {words.join(" ")}
          </span>
          <span className="whitespace-nowrap">
            {lastWord} <span className="text-gradient">{content.titleAccent}</span>
          </span>
        </h1>
        <p className="ref-lead" style={{ color: "rgb(255 255 255 / 0.8)", maxWidth: `max(240px, ${u(190)})` }}>
          {content.text}
        </p>
        <div className="flex flex-wrap items-center" style={{ gap: u(12) }}>
          <RefButton href="/about">{content.primaryCta}</RefButton>
          <Link href={safeHref(content.secondaryCtaUrl, "/about")} className="ref-btn ref-btn-ghost">
            <span
              className="flex items-center justify-center rounded-full border border-white/60"
              style={{ width: "1.9em", height: "1.9em" }}
            >
              <Play className="fill-current" style={{ width: "0.8em", height: "0.8em" }} />
            </span>
            {content.secondaryCta}
          </Link>
        </div>
      </section>

      <RefCards top={10} items={content.values} icons={valueIcons} dark />

      <RefFeatures {...content.more} dark />

      <RefSections sections={pageSections.home} faq={pageFaqs.home} dark />

      <section style={{ marginTop: u(34) }}>
        <h2 className="ref-h2" style={{ maxWidth: u(150), fontSize: `max(24px, ${u(14.5)})`, lineHeight: 1.25 }}>
          {content.sectionTitle}
        </h2>
        <p className="ref-text" style={{ color: "rgb(255 255 255 / 0.78)", maxWidth: `max(240px, ${u(150)})`, marginTop: u(9) }}>
          {content.sectionText}
        </p>
        <Link
          href="/culture"
          className="ref-text group inline-flex items-center font-semibold"
          style={{ color: "var(--color-brand-soft)", gap: u(4), marginTop: u(8) }}
        >
          {content.sectionCta}
          <ArrowRight className="transition group-hover:translate-x-1" style={{ width: "1.1em", height: "1.1em" }} />
        </Link>
      </section>

    </RefPage>
  );
}
