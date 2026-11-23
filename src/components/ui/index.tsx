import Link from "next/link";
import { ArrowRight, type LucideIcon } from "lucide-react";
import { LogoMark } from "@/components/brand/Logo";

type ButtonProps = {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "ghost-dark";
  icon?: React.ReactNode;
  className?: string;
};

const buttonBase =
  "group inline-flex items-center gap-2.5 rounded-full px-6 py-3 text-sm font-bold transition duration-300 hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-bright";

const buttonVariants = {
  primary: "btn-brand text-white",
  "ghost-dark": "border border-white/25 bg-white/5 text-white hover:bg-white/10",
};

export function ButtonLink({ href, children, variant = "primary", icon, className = "" }: ButtonProps) {
  return (
    <Link href={href} className={`${buttonBase} ${buttonVariants[variant]} ${className}`}>
      {variant === "ghost-dark" && icon}
      {children}
      {variant === "primary" &&
        (icon ?? <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />)}
    </Link>
  );
}

export function Eyebrow({ children, dark = false }: { children: React.ReactNode; dark?: boolean }) {
  return (
    <p
      className={`text-[0.8rem] font-extrabold uppercase tracking-[0.12em] ${dark ? "text-white/80" : "text-brand"}`}
    >
      {children}
    </p>
  );
}

export function IconCard({
  icon: Icon,
  title,
  dark = false,
}: {
  icon: LucideIcon;
  title: string;
  dark?: boolean;
}) {
  return (
    <div
      className={`${dark ? "glass-dark text-white" : "glass text-ink"} flex h-full flex-col items-center justify-center gap-3 rounded-2xl px-4 py-6 text-center transition duration-300 hover:-translate-y-1.5`}
    >
      <Icon
        className={`icon-glow h-10 w-10 ${dark ? "text-brand-bright" : "text-brand"}`}
        strokeWidth={1.7}
        fill="currentColor"
        fillOpacity={0.2}
      />
      <span className="max-w-[9rem] text-base font-semibold leading-snug">{title}</span>
    </div>
  );
}

export function CtaBanner({
  text,
  href,
  dark = false,
}: {
  text: string;
  href: string;
  dark?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`group flex items-center gap-5 rounded-3xl px-6 py-6 transition duration-300 hover:-translate-y-1 sm:px-9 ${
        dark
          ? "bg-gradient-to-r from-[#15131f] via-[#1d1a2e] to-[#2a2540] text-white shadow-[0_24px_50px_-24px_rgba(30,20,80,0.9)]"
          : "glass text-ink"
      }`}
    >
      <LogoMark onDark={dark} className="h-14 w-16 shrink-0 sm:h-16 sm:w-[4.5rem]" />
      {!dark && <span className="hidden h-10 w-px bg-ink/10 sm:block" />}
      <span className="flex-1 text-lg font-bold sm:text-xl">{text}</span>
      <span
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition group-hover:translate-x-1 ${
          dark ? "border border-brand-soft/70 text-brand-light" : "bg-brand-deep text-white"
        }`}
      >
        <ArrowRight className="h-5 w-5" />
      </span>
    </Link>
  );
}

export function Container({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={`mx-auto w-full max-w-6xl px-5 sm:px-8 ${className}`}>{children}</div>;
}

/** Only same-site paths and http(s) links are allowed in admin-editable URLs. */
export function safeHref(value: string, fallback: string) {
  return /^(\/(?!\/)|https?:\/\/)/.test(value) ? value : fallback;
}
