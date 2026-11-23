import type { CSSProperties } from "react";
import Link from "next/link";
import { ArrowRight, Check, Compass, Handshake, Layers, Plus, Quote, Sparkles, Sprout, Target, type LucideIcon } from "lucide-react";
import type { PageSection } from "@/lib/content";
import { LogoMark } from "@/components/brand/Logo";
import sizes from "../../../public/art/sizes.json";

/*
 * Building blocks for the reference-accurate pages.
 *
 * Every number passed to these components is a measurement taken from the design,
 * in design units (the design's page panel is 384 units wide). The CSS in
 * globals.css (".ref" section) turns a unit into pixels for the current screen.
 */

/** A length of `n` design units. */
export const u = (n: number) => `calc(var(--u) * ${n})`;

export type ArtName = keyof typeof sizes;

/**
 * Pieces that use a hand-drawn vector (public/art-vector/*.svg, written by
 * scripts/build-art-vector.cjs) instead of the artwork cut from the design.
 * Used where the design's artwork is cut off and a complete shape is wanted.
 */
const vectorArt: Partial<Record<ArtName, { width: number; height: number }>> = {
  // rings: { width: 760, height: 660 },   <- uncomment to use the drawn full-round rings on About
  // The Life loops are cut off on the right in the design, so the complete drawn version is used.
  // loops: { width: 720, height: 660 },
};

function artFile(name: ArtName) {
  const vector = vectorArt[name];
  return vector
    ? { src: `/art-vector/${name}.svg`, ...vector }
    : { src: `/art/${name}.webp?v=${sizes[name].v}`, ...sizes[name] };
}

/**
 * Artwork cut from the design, placed where it sits on the design's panel (x, y, width in units).
 * With `bleed`, it is instead held against the right edge of the screen (see ".ref-art.bleed").
 */
export function RefArt({
  name,
  x,
  y,
  w,
  bleed = false,
  edge = false,
}: {
  name: ArtName;
  x: number;
  y: number;
  w: number;
  bleed?: boolean;
  /** Hold the artwork against the right edge of the screen (for pieces the design cuts off there). */
  edge?: boolean;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={artFile(name).src}
      alt=""
      aria-hidden="true"
      width={artFile(name).width}
      height={artFile(name).height}
      className={`ref-art${bleed ? " bleed" : ""}${edge ? " edge" : ""}`}
      style={{ "--x": x, "--y": y, "--aw": w } as CSSProperties}
    />
  );
}

/** Artwork anchored in the bottom-right corner of the page, running out to the screen edge. */
export function RefCorner({ name }: { name: ArtName }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`/art/${name}.webp?v=${sizes[name].v}`}
      alt=""
      aria-hidden="true"
      width={sizes[name].width}
      height={sizes[name].height}
      className="ref-swirl"
    />
  );
}

/** The smoky violet swirl in the bottom-right corner of a light page. */
export function RefSwirl() {
  return <RefCorner name="swirl" />;
}

/** One page of the design: the light (or dark) backdrop with the 384-unit panel centred on it. */
export function RefPage({
  children,
  dark = false,
  bottom = 40,
}: {
  children: React.ReactNode;
  dark?: boolean;
  /** Space under the last element, in units. */
  bottom?: number;
}) {
  return (
    <div className={`${dark ? "backdrop-dark text-white" : "backdrop-light"} overflow-hidden`}>
      <div className="ref" style={{ paddingBottom: u(bottom) }}>
        {children}
      </div>
    </div>
  );
}

export function RefButton({
  href,
  children,
  top,
}: {
  href: string;
  children: React.ReactNode;
  /** Space above the button in units, where it differs from the default 13. */
  top?: number;
}) {
  return (
    <Link href={href} className="ref-btn btn-brand" style={top === undefined ? undefined : { marginTop: u(top) }}>
      {children}
      <ArrowRight />
    </Link>
  );
}

/**
 * Eyebrow, headline, paragraph and button with the page's artwork beside them.
 * The hero is one full screen tall (see ".ref-hero" in globals.css).
 */
export function RefHero({
  eyebrow,
  title,
  text,
  cta,
  textWidth,
  art,
}: {
  /** The artwork and where it sits on the design's panel (x, y, width in units). */
  art: { name: ArtName; x: number; y: number; w: number; edge?: boolean };
  /** No longer used for layout (the hero is centred in a full screen); kept so pages read like the design notes. */
  top?: number;
  eyebrow: string;
  title: string;
  text: string;
  cta?: { label: string; href: string };
  /** Paragraph width in units, where the design's differs from the default. */
  textWidth?: number;
}) {
  const ratio = artFile(art.name).height / artFile(art.name).width;
  return (
    <section
      className="ref-hero"
      style={{ "--x": art.x, "--y": art.y, "--aw": art.w, "--ratio": ratio } as CSSProperties}
    >
      <RefArt {...art} bleed />
      <p className="ref-eyebrow">{eyebrow}</p>
      {/* pre-line: a line break in the title text is kept, so headlines break where the design breaks them */}
      <h1 className="ref-h1" style={{ whiteSpace: "pre-line" }}>
        {title}
      </h1>
      <p className="ref-lead" style={textWidth ? { maxWidth: `max(250px, ${u(textWidth)})` } : undefined}>
        {text}
      </p>
      {cta && <RefButton href={cta.href}>{cta.label}</RefButton>}
    </section>
  );
}

/** A row of glass cards, each with an icon above its label. */
export function RefCards({
  items,
  icons,
  top,
  dark = false,
}: {
  items: string[];
  icons: LucideIcon[];
  top: number;
  dark?: boolean;
}) {
  return (
    <ul
      className={`ref-grid ${items.length === 3 ? "sm:grid-cols-3" : "grid-cols-2 sm:grid-cols-4"}`}
      style={{ marginTop: u(top) }}
    >
      {items.map((item, index) => {
        const Icon = icons[index % icons.length];
        return (
          <li key={item} className={`ref-card ${dark ? "glass-dark" : "glass"}`}>
            <Icon
              className={`ref-icon icon-glow ${dark ? "text-brand-soft" : "text-brand"}`}
              strokeWidth={1.7}
              fill="currentColor"
              fillOpacity={0.22}
            />
            <span className="ref-card-label">{item}</span>
          </li>
        );
      })}
    </ul>
  );
}

/** Lower section: a heading, a short line and (optionally) a button. */
export function RefSection({
  top,
  id,
  title,
  text,
  cta,
  textWidth = 150,
}: {
  top: number;
  id?: string;
  title: string;
  text: string;
  cta?: { label: string; href: string };
  textWidth?: number;
}) {
  return (
    <section id={id} style={{ marginTop: u(top) }}>
      <h2 className="ref-h2">{title}</h2>
      <p className="ref-text" style={{ maxWidth: `max(240px, ${u(textWidth)})` }}>
        {text}
      </p>
      {cta && (
        <RefButton href={cta.href} top={10}>
          {cta.label}
        </RefButton>
      )}
    </section>
  );
}

/** The wide banner with the "A", a line of text and a round arrow. */
export function RefBanner({
  top,
  text,
  href,
  dark = false,
}: {
  top: number;
  text: string;
  href: string;
  dark?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`ref-banner ${
        dark
          ? "bg-gradient-to-r from-[#15131f] via-[#1d1a2e] to-[#2a2540] text-white shadow-[0_24px_50px_-24px_rgba(30,20,80,0.9)]"
          : "glass text-ink"
      }`}
      style={{ marginTop: u(top), minHeight: u(dark ? 72 : 50), ...(dark ? { paddingInline: u(18), gap: u(16) } : {}) }}
    >
      <span className="relative shrink-0" style={{ width: `max(40px, ${u(dark ? 50 : 34)})` }}>
        {dark && <span className="absolute inset-0 rounded-full bg-brand/60 blur-2xl" />}
        <LogoMark onDark={dark} className="relative h-auto w-full" />
      </span>
      {!dark && <span className="self-stretch bg-ink/10" style={{ width: 1 }} />}
      {/* pre-line: a line break in the text is kept, as in the design's two-line banner */}
      <span
        className="ref-banner-text"
        style={{ whiteSpace: "pre-line", ...(dark ? { fontSize: `max(18px, ${u(12.5)})` } : {}) }}
      >
        {text}
      </span>
      <span
        className={`ref-round ${dark ? "border-2 border-brand-bright text-brand-light" : "bg-brand-deep text-white"}`}
        style={dark ? { width: `max(40px, ${u(27)})`, height: `max(40px, ${u(27)})` } : undefined}
      >
        <ArrowRight />
      </span>
    </Link>
  );
}

const featureIcons = [Target, Layers, Sprout, Handshake, Compass, Sparkles];

function SectionHead({
  eyebrow,
  title,
  text,
  dark,
  center = false,
}: {
  eyebrow: string;
  title: string;
  text: string;
  dark: boolean;
  center?: boolean;
}) {
  return (
    <div className={center ? "mx-auto text-center" : ""} style={center ? { maxWidth: `max(280px, ${u(250)})` } : undefined}>
      <p
        className={`ref-eyebrow inline-flex items-center ${center ? "justify-center" : ""}`}
        style={{ gap: u(5), ...(dark ? { color: "var(--color-brand-soft)" } : {}) }}
      >
        <span className="btn-brand inline-block rounded-full" style={{ width: u(14), height: 3 }} />
        {eyebrow}
      </p>
      <h2 className="ref-h2" style={{ marginTop: u(6), fontSize: `max(26px, ${u(17)})` }}>
        {title}
      </h2>
      <p
        className="ref-text"
        style={{ maxWidth: center ? "none" : `max(260px, ${u(230)})`, ...(dark ? { color: "rgb(255 255 255 / 0.75)" } : {}) }}
      >
        {text}
      </p>
    </div>
  );
}

/** A titled section with a grid of cards, each with a glowing icon, a title and a short text. */
export function RefFeatures({
  top = 52,
  eyebrow,
  title,
  text,
  items,
  dark = false,
}: {
  top?: number;
  eyebrow: string;
  title: string;
  text: string;
  items: { title: string; text: string }[];
  dark?: boolean;
}) {
  const columns = items.length % 3 === 0 ? "sm:grid-cols-3" : "sm:grid-cols-2";
  return (
    <section style={{ marginTop: u(top) }}>
      <SectionHead eyebrow={eyebrow} title={title} text={text} dark={dark} />
      <ul className={`ref-grid ${columns}`} style={{ marginTop: u(16), gap: u(7) }}>
        {items.map((item, index) => {
          const Icon = featureIcons[index % featureIcons.length];
          return (
            <li
              key={item.title}
              className={`ref-panel group relative overflow-hidden transition duration-300 hover:-translate-y-1.5 ${dark ? "glass-dark" : "glass"}`}
              style={{ padding: `${u(14)} ${u(13)}` }}
            >
              {/* accent line that lights up on hover */}
              <span className="btn-brand absolute inset-x-0 top-0 h-1 origin-left scale-x-[0.28] transition-transform duration-500 group-hover:scale-x-100" />
              <span
                className="btn-brand flex items-center justify-center rounded-2xl text-white"
                style={{ width: `max(40px, ${u(24)})`, height: `max(40px, ${u(24)})` }}
              >
                <Icon style={{ width: "52%", height: "52%" }} strokeWidth={1.9} />
              </span>
              <h3 className="ref-card-label" style={{ maxWidth: "none", marginTop: u(9), fontSize: `max(16px, ${u(10)})` }}>
                {item.title}
              </h3>
              <p
                className={`ref-small ${dark ? "text-white/70" : "text-ink-soft"}`}
                style={{ marginTop: u(5), lineHeight: 1.6, fontSize: `max(13px, ${u(7.6)})` }}
              >
                {item.text}
              </p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function Faq({ items, dark }: { items: { q: string; a: string }[]; dark: boolean }) {
  return (
    <section style={{ marginTop: u(52) }}>
      <SectionHead
        eyebrow="Questions"
        title="Good to know"
        text="Short answers to the questions we hear most often."
        dark={dark}
        center
      />
      <div className="mx-auto" style={{ marginTop: u(16), maxWidth: `max(300px, ${u(280)})` }}>
        {items.map((item) => (
          <details
            key={item.q}
            className={`ref-panel group ${dark ? "glass-dark" : "glass"}`}
            style={{ marginTop: u(5), padding: `${u(9)} ${u(12)}` }}
          >
            <summary className="ref-body flex cursor-pointer list-none items-center justify-between font-bold [&::-webkit-details-marker]:hidden" style={{ gap: u(8) }}>
              {item.q}
              <span
                className="btn-brand flex shrink-0 items-center justify-center rounded-full text-white transition-transform duration-300 group-open:rotate-45"
                style={{ width: `max(26px, ${u(15)})`, height: `max(26px, ${u(15)})` }}
              >
                <Plus style={{ width: "58%", height: "58%" }} strokeWidth={2.6} />
              </span>
            </summary>
            <p className={`ref-small ${dark ? "text-white/75" : "text-ink-soft"}`} style={{ marginTop: u(6), lineHeight: 1.65, fontSize: `max(14px, ${u(7.8)})` }}>
              {item.a}
            </p>
          </details>
        ))}
      </div>
    </section>
  );
}

/**
 * The extra middle sections of a page: a checklist beside its heading, numbered steps joined
 * by a line, a full-colour statement band, and (before the statement) the page's questions.
 */
export function RefSections({
  sections,
  faq,
  dark = false,
}: {
  sections?: PageSection[];
  faq?: { q: string; a: string }[];
  dark?: boolean;
}) {
  if (!sections) return null;
  const glass = dark ? "glass-dark" : "glass";
  const soft = dark ? "text-white/70" : "text-ink-soft";
  return (
    <>
      {sections.map((section, index) => {
        if (section.type === "statement") {
          return (
            <div key={index}>
              {faq && <Faq items={faq} dark={dark} />}
              <section
                className="relative overflow-hidden text-center text-white"
                style={{
                  marginTop: u(52),
                  padding: `${u(26)} ${u(22)}`,
                  borderRadius: u(12),
                  background: "linear-gradient(120deg, var(--color-brand-dark) 0%, var(--color-brand-deep) 40%, var(--color-brand) 75%, var(--color-brand-bright) 100%)",
                  boxShadow: "0 30px 60px -28px rgb(79 31 224 / 0.75)",
                }}
              >
                <span className="absolute -left-10 -top-16 h-56 w-56 rounded-full bg-white/15 blur-3xl" />
                <span className="absolute -bottom-20 right-0 h-64 w-64 rounded-full bg-brand-soft/30 blur-3xl" />
                <Quote className="relative mx-auto fill-white/25 text-white/25" style={{ width: u(22), height: u(22) }} aria-hidden="true" />
                <p className="ref-h2 relative mx-auto" style={{ marginTop: u(8), maxWidth: u(280), fontSize: `max(21px, ${u(13.5)})`, lineHeight: 1.4 }}>
                  {section.text}
                </p>
              </section>
            </div>
          );
        }
        if (section.type === "checklist") {
          return (
            <section key={index} className="grid items-center md:grid-cols-[1fr_1.15fr]" style={{ marginTop: u(52), gap: u(16) }}>
              <SectionHead {...section} dark={dark} />
              <ul className={`ref-panel relative overflow-hidden ${glass}`} style={{ padding: `${u(10)} ${u(14)} ${u(10)} ${u(17)}` }}>
                <span className="btn-brand absolute inset-y-0 left-0" style={{ width: u(3) }} />
                {section.items.map((item) => (
                  <li
                    key={item}
                    className={`ref-body flex items-center font-semibold ${dark ? "border-white/10" : "border-ink/10"} [&:not(:last-child)]:border-b`}
                    style={{ gap: u(9), paddingBlock: u(6.5) }}
                  >
                    <span
                      className="btn-brand flex shrink-0 items-center justify-center rounded-full text-white"
                      style={{ width: `max(24px, ${u(14)})`, height: `max(24px, ${u(14)})` }}
                    >
                      <Check style={{ width: "56%", height: "56%" }} strokeWidth={3.2} />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </section>
          );
        }
        return (
          <section key={index} style={{ marginTop: u(52) }}>
            <SectionHead {...section} dark={dark} center />
            <ol className="ref-grid relative grid-cols-2 sm:grid-cols-4" style={{ marginTop: u(18), gap: u(7) }}>
              {/* line joining the step numbers on wide screens */}
              <span
                className="btn-brand absolute hidden opacity-40 sm:block"
                style={{ left: "12.5%", right: "12.5%", top: `max(22px, ${u(13)})`, height: 2 }}
              />
              {section.items.map((item, step) => (
                <li key={item.title} className="relative flex flex-col text-center">
                  <span
                    className="btn-brand relative mx-auto flex items-center justify-center rounded-full font-extrabold text-white ring-4 ring-white/40"
                    style={{ width: `max(44px, ${u(26)})`, height: `max(44px, ${u(26)})`, fontSize: `max(16px, ${u(10.5)})` }}
                  >
                    {String(step + 1).padStart(2, "0")}
                  </span>
                  <div
                    className={`ref-panel flex-1 transition duration-300 hover:-translate-y-1 ${glass}`}
                    style={{ marginTop: u(8), padding: `${u(8)} ${u(6)}` }}
                  >
                    <h3 className="ref-card-label" style={{ maxWidth: "none", fontSize: `max(15px, ${u(9.4)})` }}>
                      {item.title}
                    </h3>
                    <p className={`ref-small ${soft}`} style={{ marginTop: u(4), lineHeight: 1.55, fontSize: `max(13px, ${u(7.3)})` }}>
                      {item.text}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        );
      })}
    </>
  );
}
