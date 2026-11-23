import { Mail, MapPin, Phone } from "lucide-react";
import { ActionForm } from "@/components/forms/ActionForm";
import { Honeypot, SiteField } from "@/components/forms/SiteFields";
import { SocialLinks } from "@/components/layout/Footer";
import { RefFeatures, RefPage, u } from "@/components/ref";
import { getPage, getSettings } from "@/lib/cms";
import sizes from "../../../../public/art/sizes.json";
import { pageMetadata } from "@/lib/seo";
import { sendMessage } from "@/server/actions/public";

export const generateMetadata = () => pageMetadata("contact");

// All numbers below are measurements from the design, in design units (see components/ref).
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
    <RefPage bottom={34}>
      {/* One full screen: details on the left, the form (with the chat bubble above it) on the right. */}
      <div
        className="grid items-center md:grid-cols-[1fr_auto]"
        style={{
          columnGap: u(10),
          minHeight: "100svh",
          paddingTop: `max(5.5rem, ${u(38)})`,
          paddingBottom: u(10),
        }}
      >
        {/* Left: heading, contact details, social links */}
        <div>
          <p className="ref-eyebrow">{content.eyebrow}</p>
          <h1 className="ref-h1">{content.title}</h1>
          <p className="ref-lead" style={{ maxWidth: `max(240px, ${u(150)})` }}>
            {content.text}
          </p>

          <div className="bg-ink/10" style={{ width: u(46), height: 1, marginTop: u(15) }} />

          <ul style={{ marginTop: u(18) }}>
            {details.map(({ icon: Icon, label, href }) => (
              <li key={label} className="ref-body flex items-center font-medium" style={{ gap: u(11), marginTop: u(10) }}>
                <span
                  className="flex shrink-0 items-center justify-center rounded-full bg-brand text-white shadow-[0_8px_18px_-8px_rgba(79,31,224,0.9)]"
                  style={{ width: `max(30px, ${u(17)})`, height: `max(30px, ${u(17)})` }}
                >
                  <Icon style={{ width: "52%", height: "52%" }} />
                </span>
                {href ? (
                  <a href={href} className="hover:text-brand">
                    {label}
                  </a>
                ) : (
                  <span className="whitespace-pre-line">{label}</span>
                )}
              </li>
            ))}
          </ul>

          <div style={{ marginTop: u(18) }}>
            <SocialLinks settings={settings} className="text-ink" />
          </div>

        </div>

        {/* Right: the message form, where it sits on the design's panel */}
        <div className="relative mt-10 md:mt-0" style={{ paddingTop: u(82) }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`/art/bubble.webp?v=${sizes.bubble.v}`}
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute select-none"
            // Starts at the top of this column (which begins below the header) and stays within its width.
            style={{ zIndex: -1, top: 0, right: u(-10), width: `min(108%, ${u(158)})`, maxWidth: "none" }}
          />
          <div
            className="glass ref-panel"
            style={{ width: `max(300px, ${u(178)})`, maxWidth: "100%", padding: u(9) }}
          >
          <h2 className="sr-only">Send us a message</h2>
          <ActionForm action={sendMessage} submitLabel={content.formButton} className="space-y-4" replaceOnSuccess>
            <SiteField label="Your Name" name="name" required autoComplete="name" />
            <SiteField label="Your Email" name="email" type="email" required autoComplete="email" />
            <SiteField label="Your Message" name="message" required rows={4} />
            <Honeypot />
          </ActionForm>
          </div>
        </div>
      </div>

      <RefFeatures {...content.more} />
    </RefPage>
  );
}
