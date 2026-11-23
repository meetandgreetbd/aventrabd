import { RefBanner, RefFeatures, RefHero, RefPage, RefSections, u } from "@/components/ref";
import { getMembers, getPage } from "@/lib/cms";
import { pageFaqs, pageSections } from "@/lib/content";
import { mediaUrl, pageMetadata } from "@/lib/seo";

export const generateMetadata = () => pageMetadata("leadership");

/** Neutral bust shown until a real photo is uploaded in the admin (as in the design). */
function Bust() {
  return (
    <svg viewBox="0 0 120 112" style={{ width: u(48), height: "auto" }} aria-hidden="true">
      <defs>
        <linearGradient id="bust-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#6f6f7d" />
          <stop offset="0.55" stopColor="#9a9aa8" />
          <stop offset="1" stopColor="#c4c4cf" />
        </linearGradient>
      </defs>
      <ellipse cx="60" cy="34" rx="22" ry="26" fill="url(#bust-fill)" />
      <path d="M46 60 h28 v8 c 22 4, 38 16, 42 44 H4 C 8 84, 24 72, 46 68 Z" fill="url(#bust-fill)" />
    </svg>
  );
}

// All numbers below are measurements from the design, in design units (see components/ref).
export default async function LeadershipPage() {
  const [{ content }, leaders, team] = await Promise.all([
    getPage("leadership"),
    getMembers("leadership"),
    getMembers("team"),
  ]);
  const groups = [
    { title: "", people: leaders },
    { title: "Our Team", people: team },
  ].filter((group) => group.people.length > 0);

  return (
    <RefPage>

      <RefHero
        art={{ name: "compass", x: 190, y: 61, w: 184 }}
        top={88}
        eyebrow={content.eyebrow}
        title={content.title}
        text={content.text}
        cta={groups.length > 0 ? { label: content.cta, href: "#leaders" } : undefined}
        textWidth={172}
      />

      <div id="leaders">
        {groups.map((group, groupIndex) => (
          <section key={group.title || "leaders"} style={{ marginTop: u(groupIndex === 0 ? 10 : 22) }}>
            {group.title && (
              <h2 className="ref-h2" style={{ marginBottom: u(10) }}>
                {group.title}
              </h2>
            )}
            <ul className="ref-grid sm:grid-cols-3">
              {group.people.map((person) => (
                <li
                  key={person.id}
                  className="glass ref-card"
                  style={{ gap: u(4), paddingBlock: u(11), justifyContent: "flex-start" }}
                >
                  {person.photo ? (
                    // Uploaded photos are served by our own /media route.
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={mediaUrl(person.photo)}
                      alt=""
                      loading="lazy"
                      className="rounded-full object-cover shadow-lg"
                      style={{ width: u(46), height: u(46) }}
                    />
                  ) : (
                    <Bust />
                  )}
                  <h3 className="ref-card-label" style={{ maxWidth: "none", marginTop: u(3) }}>
                    {person.name}
                  </h3>
                  <p className="ref-small text-ink-soft">{person.title}</p>
                  {person.bio && (
                    <p className="ref-small text-ink-soft" style={{ marginTop: u(3), lineHeight: 1.5 }}>
                      {person.bio}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <RefFeatures {...content.more} />

      <RefSections sections={pageSections.leadership} faq={pageFaqs.leadership} />

      <RefBanner top={32} text={content.bannerText} href="/careers" />
    </RefPage>
  );
}
