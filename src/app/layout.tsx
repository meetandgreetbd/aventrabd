import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { getPage, getSettings } from "@/lib/cms";
import { pageInfo } from "@/lib/content";
import { siteUrl } from "@/lib/seo";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const [settings, home] = await Promise.all([getSettings(), getPage("home")]);
  return {
    metadataBase: new URL(siteUrl()),
    title: { default: settings.siteName, template: `%s | ${settings.siteName}` },
    description: home.seo.seoDescription || pageInfo.home.description,
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${jakarta.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">{children}</body>
    </html>
  );
}
