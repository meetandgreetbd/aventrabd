import type { CSSProperties } from "react";
import { ButtonLink, Container, Eyebrow } from "@/components/ui";
import { Reveal } from "@/components/ui/Reveal";
import { Art, type ArtName } from "@/components/visuals";

type Props = {
  eyebrow: string;
  title: string;
  text: string;
  cta?: { label: string; href: string };
  art: ArtName;
};

/**
 * Where each illustration sits on large screens, in rem.
 * size  = rendered width; shift = how far it runs past the content column's right edge
 * (so it is cropped by the page edge, as in the design); drop = extra space below the header.
 */
const placement: Record<ArtName, { size: number; shift: number; drop: number }> = {
  rings: { size: 42, shift: 15, drop: 0 },
  network: { size: 31, shift: 6, drop: 0.5 },
  bars: { size: 37, shift: 8, drop: 1 },
  loops: { size: 35, shift: 9, drop: 0 },
  cubes: { size: 31, shift: 7, drop: 0 },
  compass: { size: 40, shift: 12, drop: 0 },
  bubble: { size: 30, shift: 4, drop: 0 },
  globe: { size: 46, shift: 0, drop: 0 },
};

/**
 * Shared hero for the light pages. The illustration is a background layer of the
 * whole hero (large, fading in from the left, running off the right edge), not a
 * boxed picture, and the copy sits on top of it.
 */
export function PageHero({ eyebrow, title, text, cta, art }: Props) {
  const { size, shift, drop } = placement[art];
  const style = {
    "--art-size": `${size}rem`,
    "--art-shift": `${shift}rem`,
    "--art-drop": `${drop}rem`,
  } as CSSProperties;

  return (
    <section className="relative pt-32 pb-8 sm:pt-40">
      <Art name={art} className="hero-art" style={style} />
      <Container className="relative">
        <Reveal className="hero-copy">
          <Eyebrow>{eyebrow}</Eyebrow>
          <h1 className="mt-4 text-4xl font-extrabold leading-[1.1] tracking-tight text-ink sm:text-5xl lg:text-[3.25rem]">
            {title}
          </h1>
          <p className="mt-5 max-w-lg text-base leading-relaxed text-ink-soft sm:text-[1.05rem]">{text}</p>
          {cta && (
            <ButtonLink href={cta.href} className="mt-8">
              {cta.label}
            </ButtonLink>
          )}
        </Reveal>
      </Container>
    </section>
  );
}
