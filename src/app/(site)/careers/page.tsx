import { Gem, Rocket, Trophy, Users } from "lucide-react";
import { RefBanner, RefCards, RefFeatures, RefHero, RefPage, u } from "@/components/ref";
import { getPage } from "@/lib/cms";
import { pageMetadata } from "@/lib/seo";

export const generateMetadata = () => pageMetadata("careers");

const icons = [Rocket, Users, Gem, Trophy];

// All numbers below are measurements from the design, in design units (see components/ref).
export default async function CareersPage() {
  const { content } = await getPage("careers");
  return (
    <RefPage bottom={14}>

      <RefHero
        art={{ name: "bars", x: 166, y: 61, w: 210 }}
        top={112}
        eyebrow={content.eyebrow}
        title={content.title}
        text={content.text}
        cta={{ label: content.cta, href: "/careers/positions" }}
        textWidth={170}
      />

      <h2 className="ref-h2" style={{ marginTop: u(12) }}>
        {content.whyTitle}
      </h2>
      <RefCards top={14} items={content.cards} icons={icons} />

      <RefFeatures {...content.more} />

      <RefBanner top={9} text={content.bannerText} href="/careers/positions" dark />
    </RefPage>
  );
}
