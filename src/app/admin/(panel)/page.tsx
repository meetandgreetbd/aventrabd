import Link from "next/link";
import { count, eq } from "drizzle-orm";
import { PageTitle } from "@/components/admin/ui";
import { getDb, schema } from "@/db";
import { requireUser } from "@/lib/auth";
import { getSettings } from "@/lib/cms";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const user = await requireUser();
  const db = getDb();
  const [[openJobs], [newApplications], [unread], [members], settings] = await Promise.all([
    db.select({ total: count() }).from(schema.jobs).where(eq(schema.jobs.status, "open")),
    db.select({ total: count() }).from(schema.applications).where(eq(schema.applications.status, "new")),
    db.select({ total: count() }).from(schema.messages).where(eq(schema.messages.isRead, false)),
    db.select({ total: count() }).from(schema.members),
    getSettings(),
  ]);

  const tiles = [
    { label: "Open job posts", value: openJobs.total, href: "/admin/jobs" },
    { label: "New applications", value: newApplications.total, href: "/admin/applications" },
    { label: "Unread messages", value: unread.total, href: "/admin/messages" },
    { label: "Members", value: members.total, href: "/admin/members" },
  ];

  return (
    <>
      <PageTitle title={`Welcome, ${user.name}`} description="What needs your attention today." />
      {settings.siteNoindex && (
        <p className="mb-5 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          The whole site is currently hidden from search engines.
          {user.role === "admin" && (
            <>
              {" "}
              <Link href="/admin/pages/home" className="font-semibold underline">
                Change this on the Home SEO screen
              </Link>{" "}
              when you are ready to launch.
            </>
          )}
        </p>
      )}
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {tiles.map((tile) => (
          <li key={tile.label}>
            <Link
              href={tile.href}
              className="block rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-brand-soft"
            >
              <p className="text-3xl font-bold text-slate-900">{tile.value}</p>
              <p className="mt-1 text-sm text-slate-500">{tile.label}</p>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
