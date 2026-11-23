import Link from "next/link";
import { LogoMark } from "@/components/brand/Logo";

export const metadata = { title: "Page not found", robots: { index: false, follow: false } };

export default function NotFound() {
  return (
    <main className="backdrop-light flex flex-1 flex-col items-center justify-center px-6 py-24 text-center">
      <LogoMark className="h-20 w-20" />
      <h1 className="mt-6 text-4xl font-bold tracking-tight">Page not found</h1>
      <p className="mt-3 max-w-md text-ink-soft">
        The page you are looking for does not exist or has been moved.
      </p>
      <Link
        href="/"
        className="btn-brand mt-8 rounded-full px-6 py-3 text-sm font-bold text-white"
      >
        Back to home
      </Link>
    </main>
  );
}
