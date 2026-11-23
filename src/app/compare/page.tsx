import { notFound } from "next/navigation";
import { CompareView } from "./CompareView";

export const metadata = { title: "Design comparison", robots: { index: false, follow: false } };

/**
 * Development tool: the reference design next to the live page.
 * Returns 404 in production builds, so it never appears on the real site.
 */
export default function ComparePage() {
  if (process.env.NODE_ENV === "production") notFound();
  return <CompareView />;
}
