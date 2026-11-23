"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/brand/Logo";

const links = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/culture", label: "Culture" },
  { href: "/careers", label: "Careers" },
  { href: "/learning", label: "Learning" },
  { href: "/contact", label: "Contact" },
];

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

export function Header() {
  const pathname = usePathname();
  const dark = pathname === "/";
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const surface = scrolled
    ? dark
      ? "bg-night/75 backdrop-blur-xl border-b border-white/10"
      : "bg-white/65 backdrop-blur-xl border-b border-white/70 shadow-[0_8px_30px_-18px_rgba(42,15,168,0.35)]"
    : "border-b border-transparent";

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${surface} ${dark ? "text-white" : "text-ink"}`}
    >
      <div className="ref-header">
        <Link href="/" aria-label="Aventra home" onClick={() => setOpen(false)}>
          <Logo onDark={dark} className="ref-logo" />
        </Link>

        <nav aria-label="Main" className="ref-nav">
          {links.map((link) => {
            const active = isActive(pathname, link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={`relative transition-opacity hover:opacity-100 ${active ? "opacity-100" : "opacity-80"}`}
              >
                {link.label}
                {active && (
                  <span className="absolute inset-x-0 -bottom-1.5 h-0.5 rounded-full bg-brand-bright" />
                )}
              </Link>
            );
          })}
          <Link
            href="/careers"
            className="ref-join btn-brand"
          >
            Join Us
          </Link>
        </nav>

        <button
          type="button"
          className="ref-menu-button flex h-11 w-11 items-center justify-center rounded-full"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <nav
          aria-label="Mobile"
          className={`flex h-[calc(100dvh-4rem)] flex-col gap-1 overflow-y-auto px-5 pb-8 pt-2 ${dark ? "bg-night" : "bg-mist"}`}
        >
          {[...links, { href: "/life", label: "Life at Aventra" }, { href: "/leadership", label: "Leadership" }].map(
            (link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                aria-current={isActive(pathname, link.href) ? "page" : undefined}
                className={`rounded-2xl px-4 py-3.5 text-lg font-semibold ${
                  isActive(pathname, link.href) ? "bg-brand-bright/15 text-brand-bright" : ""
                }`}
              >
                {link.label}
              </Link>
            ),
          )}
          <Link
            href="/careers"
            onClick={() => setOpen(false)}
            className="btn-brand mt-4 rounded-full px-6 py-3.5 text-center font-bold text-white"
          >
            Join Us
          </Link>
        </nav>
      )}
    </header>
  );
}
