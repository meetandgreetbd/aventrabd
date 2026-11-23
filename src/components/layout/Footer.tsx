import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import type { SiteSettings } from "@/lib/content";

const columns = [
  {
    title: "Company",
    links: [
      { href: "/about", label: "About" },
      { href: "/culture", label: "Culture" },
      { href: "/leadership", label: "Leadership" },
    ],
  },
  {
    title: "People",
    links: [
      { href: "/careers", label: "Careers" },
      { href: "/life", label: "Life at Aventra" },
      { href: "/learning", label: "Learning" },
    ],
  },
];

const socialIcons = {
  linkedin: (
    <path d="M6.5 9.5v8M6.5 6.2v.1M10.5 17.5v-8M10.5 13c0-2 1.3-3.5 3.3-3.5s3.2 1.3 3.2 3.6v4.4" />
  ),
  facebook: <path d="M14.5 21v-7.5h2.6l.4-3h-3V8.6c0-.9.3-1.6 1.6-1.6h1.5V4.3c-.7-.1-1.5-.2-2.3-.2-2.4 0-3.8 1.4-3.8 4v2.4H9v3h2.5V21" />,
  youtube: (
    <>
      <rect x="2.5" y="6" width="19" height="12" rx="4" />
      <path d="M10.2 9.4v5.2l4.6-2.6z" fill="currentColor" />
    </>
  ),
  x: <path d="M5 4.5l14 15M19 4.5l-14 15" />,
};

export type SocialKey = keyof typeof socialIcons;
const socialNames: Record<SocialKey, string> = {
  linkedin: "LinkedIn",
  facebook: "Facebook",
  youtube: "YouTube",
  x: "X",
};

export function SocialLinks({ settings, className = "" }: { settings: SiteSettings; className?: string }) {
  const keys = (Object.keys(socialIcons) as SocialKey[]).filter((key) => settings[key]);
  if (keys.length === 0) return null;
  return (
    <ul className={`flex gap-3 ${className}`}>
      {keys.map((key) => (
        <li key={key}>
          <a
            href={settings[key]}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={socialNames[key]}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-current/20 transition hover:-translate-y-0.5 hover:border-brand-bright hover:text-brand-bright"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              {socialIcons[key]}
            </svg>
          </a>
        </li>
      ))}
    </ul>
  );
}

export function Footer({ settings }: { settings: SiteSettings }) {
  return (
    <footer className="bg-night text-white">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-5 py-14 sm:px-8 md:grid-cols-[1.4fr_1fr_1fr_1.3fr]">
        <div>
          <Logo onDark className="h-16" />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/60">{settings.tagline}</p>
          <SocialLinks settings={settings} className="mt-6 text-white/70" />
        </div>
        {columns.map((column) => (
          <nav key={column.title} aria-label={column.title}>
            <h2 className="text-xs font-bold uppercase tracking-[0.18em] text-white/50">{column.title}</h2>
            <ul className="mt-4 space-y-3 text-sm">
              {column.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-white/75 transition hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
        <div>
          <h2 className="text-xs font-bold uppercase tracking-[0.18em] text-white/50">Contact</h2>
          <ul className="mt-4 space-y-3 text-sm text-white/75">
            {settings.phone && (
              <li className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-brand-bright" />
                <a href={`tel:${settings.phone.replace(/[^+\d]/g, "")}`} className="hover:text-white">
                  {settings.phone}
                </a>
              </li>
            )}
            {settings.email && (
              <li className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-brand-bright" />
                <a href={`mailto:${settings.email}`} className="hover:text-white">
                  {settings.email}
                </a>
              </li>
            )}
            {settings.address && (
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-bright" />
                <span className="whitespace-pre-line">{settings.address}</span>
              </li>
            )}
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <p className="mx-auto w-full max-w-6xl px-5 py-5 text-xs text-white/45 sm:px-8">
          © {new Date().getFullYear()} {settings.siteName}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
