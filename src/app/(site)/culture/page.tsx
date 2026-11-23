import { BookOpen, HeartPulse, TrendingUp, Users } from "lucide-react";
import { RefCards, RefFeatures, RefHero, RefPage, RefSection, RefSwirl } from "@/components/ref";
import { getPage } from "@/lib/cms";
import { pageMetadata } from "@/lib/seo";

export const generateMetadata = () => pageMetadata("culture");

const icons = [Users, BookOpen, TrendingUp, HeartPulse];

// All numbers below are measurements from the design, in design units (see components/ref).
export default async function CulturePage() {
  const { content } = await getPage("culture");
  return (
    <RefPage>
      <RefSwirl />

      <RefHero
        art={{ name: "network", x: 198, y: 53, w: 250 }}
        top={112}
        eyebrow={content.eyebrow}
        title={content.title}
        text={content.text}
        cta={{ label: content.cta, href: "/life" }}
      />

      <RefCards top={10} items={content.cards} icons={icons} />

      <RefFeatures {...content.more} />

      <RefSection
        top={48}
        title={content.sectionTitle}
        text={content.sectionText}
        cta={{ label: content.sectionCta, href: "/leadership" }}
        textWidth={140}
      />

    </RefPage>
  );
}
