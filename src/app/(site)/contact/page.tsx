import { Mail, MapPin, Phone } from "lucide-react";
import { ActionForm } from "@/components/forms/ActionForm";
import { Honeypot, SiteField } from "@/components/forms/SiteFields";
import { SocialLinks } from "@/components/layout/Footer";
import { Container, Eyebrow } from "@/components/ui";
import { Reveal } from "@/components/ui/Reveal";
import { Art } from "@/components/visuals";
import { getPage, getSettings } from "@/lib/cms";
import { pageMetadata } from "@/lib/seo";
import { sendMessage } from "@/server/actions/public";

export const generateMetadata = () => pageMetadata("contact");

export default async function ContactPage() {
  const [{ content }, settings] = await Promise.all([getPage("contact"), getSettings()]);
  const details = [
    settings.phone && {
      icon: Phone,
      label: settings.phone,
      href: `tel:${settings.phone.replace(/[^+\d]/g, "")}`,
    },
    settings.email && { icon: Mail, label: settings.email, href: `mailto:${settings.email}` },
    settings.address && { icon: MapPin, label: settings.address, href: undefined },
  ].filter((item) => !!item);

  return (
    <div className="backdrop-light overflow-hidden pt-32 pb-24 sm:pt-40">
      <Container className="grid gap-12 lg:grid-cols-2">
        <Reveal>
          <Eyebrow>{content.eyebrow}</Eyebrow>
          <h1 className="mt-4 text-4xl font-bold leading-[1.08] tracking-tight sm:text-5xl lg:text-[3.4rem]">
            {content.title}
          </h1>
          <p className="mt-5 max-w-md text-base leading-relaxed text-ink-soft sm:text-lg">{content.text}</p>

          <ul className="mt-10 space-y-5">
            {details.map(({ icon: Icon, label, href }) => (
              <li key={label} className="flex items-center gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand text-white shadow-[0_10px_20px_-10px_rgba(109,40,217,0.9)]">
                  <Icon className="h-5 w-5" />
                </span>
                {href ? (
                  <a href={href} className="font-medium hover:text-brand">
                    {label}
                  </a>
                ) : (
                  <span className="whitespace-pre-line font-medium">{label}</span>
                )}
              </li>
            ))}
          </ul>
          <SocialLinks settings={settings} className="mt-9 text-ink" />
        </Reveal>

        <Reveal delay={0.15} className="relative lg:mt-32">
          <div className="pointer-events-none absolute -top-44 right-2 -z-10 hidden w-64 lg:block">
            <Art name="bubble" className="w-full" />
          </div>
          <div className="glass rounded-3xl p-6 sm:p-8">
            <h2 className="sr-only">Send us a message</h2>
            <ActionForm
              action={sendMessage}
              submitLabel={content.formButton}
              className="space-y-5"
              replaceOnSuccess
            >
              <SiteField label="Your Name" name="name" required autoComplete="name" />
              <SiteField label="Your Email" name="email" type="email" required autoComplete="email" />
              <SiteField label="Your Message" name="message" required rows={5} />
              <Honeypot />
            </ActionForm>
          </div>
        </Reveal>
      </Container>
    </div>
  );
}
