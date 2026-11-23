import { PageHero } from "@/components/sections/PageHero";
import { Container, CtaBanner } from "@/components/ui";
import { Reveal } from "@/components/ui/Reveal";
import { getMembers, getPage } from "@/lib/cms";
import { mediaUrl, pageMetadata } from "@/lib/seo";

export const generateMetadata = () => pageMetadata("leadership");

/** Neutral silhouette shown until a real photo is uploaded in the admin. */
function Bust() {
  return (
    <svg viewBox="0 0 120 120" className="h-28 w-28" aria-hidden="true">
      <defs>
        <linearGradient id="bust-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8f8f9d" />
          <stop offset="1" stopColor="#4d4d5c" />
        </linearGradient>
      </defs>
      <circle cx="60" cy="40" r="25" fill="url(#bust-fill)" />
      <path d="M12 120 C 14 88, 34 74, 60 74 C 86 74, 106 88, 108 120 Z" fill="url(#bust-fill)" />
    </svg>
  );
}

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
    <div className="backdrop-light overflow-hidden pb-24">
      <PageHero
        eyebrow={content.eyebrow}
        title={content.title}
        text={content.text}
        cta={groups.length > 0 ? { label: content.cta, href: "#leaders" } : undefined}
        art="compass"
      />

      <div id="leaders">
        {groups.map((group) => (
          <section key={group.title || "leaders"} className="py-8">
            <Container>
              {group.title && (
                <h2 className="mb-7 text-3xl font-bold tracking-tight sm:text-4xl">{group.title}</h2>
              )}
              <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {group.people.map((person, index) => (
                  <li key={person.id}>
                    <Reveal delay={index * 0.08} className="h-full">
                      <article className="glass flex h-full flex-col items-center rounded-3xl px-6 py-8 text-center transition duration-300 hover:-translate-y-1.5">
                        {person.photo ? (
                          // Uploaded photos are served by our own /media route, so next/image optimisation is not configured for them.
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={mediaUrl(person.photo)}
                            alt=""
                            width={112}
                            height={112}
                            loading="lazy"
                            className="h-28 w-28 rounded-full object-cover shadow-lg"
                          />
                        ) : (
                          <Bust />
                        )}
                        <h3 className="mt-5 text-lg font-bold">{person.name}</h3>
                        <p className="mt-1 text-sm font-medium text-brand">{person.title}</p>
                        {person.bio && (
                          <p className="mt-3 text-sm leading-relaxed text-ink-soft">{person.bio}</p>
                        )}
                      </article>
                    </Reveal>
                  </li>
                ))}
              </ul>
            </Container>
          </section>
        ))}
      </div>

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
