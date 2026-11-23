import { LogoMark } from "@/components/brand/Logo";

/*
 * Decorative hero art. Each image is a vector drawn by scripts/build-art.cjs,
 * following the compositions in the design mockup.
 */

const art = {
  rings: { width: 760, height: 660 },
  network: { width: 620, height: 660 },
  bars: { width: 760, height: 640 },
  loops: { width: 720, height: 660 },
  cubes: { width: 660, height: 660 },
  compass: { width: 700, height: 640 },
  bubble: { width: 700, height: 560 },
  globe: { width: 760, height: 520 },
};

export type ArtName = keyof typeof art;

export function Art({
  name,
  className = "",
  style,
}: {
  name: ArtName;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    // Static vector artwork with a transparent background; served as-is.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`/art/${name}.svg`}
      alt=""
      aria-hidden="true"
      width={art[name].width}
      height={art[name].height}
      style={style}
      className={`pointer-events-none h-auto select-none ${className}`}
    />
  );
}

/** Home hero: the real Aventra "A" with its glow. */
export function CrystalA() {
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[40rem]" aria-hidden="true">
      <div className="animate-pulse-glow absolute inset-[8%] rounded-full bg-violet-600/45 blur-[90px]" />
      <div className="absolute inset-x-[18%] bottom-[2%] h-10 rounded-full bg-violet-500/40 blur-2xl" />
      <LogoMark
        onDark
        className="animate-float relative h-full w-full drop-shadow-[0_0_45px_rgba(168,85,247,0.55)]"
      />
    </div>
  );
}
