import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { Tracking } from "@/components/layout/Tracking";
import { getSettings } from "@/lib/cms";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSettings();
  return (
    <>
      <Tracking gtmId={settings.gtmId} gaId={settings.gaId} />
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-white focus:px-5 focus:py-3 focus:text-sm focus:font-semibold focus:text-ink"
      >
        Skip to content
      </a>
      <Header />
      <main id="main" className="flex-1">
        {children}
      </main>
      <Footer settings={settings} />
    </>
  );
}
