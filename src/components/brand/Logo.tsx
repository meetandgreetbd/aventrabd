/*
 * The logo files are vectors written by scripts/build-logo.cjs (traced from the supplied
 * artwork in brand-source/). SVGs need no optimisation, so plain <img> is used.
 */

type Props = {
  className?: string;
  /** Use on dark surfaces: switches the lettering to white. The "A" itself is the same on both. */
  onDark?: boolean;
};

/** The Aventra "A" on its own. */
export function LogoMark({ className = "" }: Props) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/brand/mark.svg"
      alt=""
      width={512}
      height={512}
      aria-hidden="true"
      className={`object-contain ${className}`}
    />
  );
}

/**
 * The one Aventra logo (the "A" with the AVENTRA lettering), in two colourways:
 * black lettering for light surfaces, white lettering for dark ones.
 */
export function Logo({ className = "h-10", onDark = false }: Props) {
  const name = `logo-on-${onDark ? "dark" : "light"}.svg`;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`/brand/${name}`}
      alt="Aventra"
      width={431}
      height={100}
      className={`w-auto object-contain ${className}`}
    />
  );
}
