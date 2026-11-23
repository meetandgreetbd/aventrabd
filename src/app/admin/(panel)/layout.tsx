import Link from "next/link";
import { count, eq } from "drizzle-orm";
import { AdminNav } from "@/components/admin/Nav";
import { LogoMark } from "@/components/brand/Logo";
import { getDb, schema } from "@/db";
import { requireUser } from "@/lib/auth";
import { logout } from "@/server/actions/auth";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const db = getDb();
  const [[unread], [fresh]] = await Promise.all([
    db.select({ total: count() }).from(schema.messages).where(eq(schema.messages.isRead, false)),
    db.select({ total: count() }).from(schema.applications).where(eq(schema.applications.status, "new")),
  ]);

  const items = [
    { href: "/admin", label: "Dashboard" },
    { href: "/admin/jobs", label: "Job posts" },
    { href: "/admin/applications", label: "Applications", badge: fresh.total },
    { href: "/admin/members", label: "Members" },
    { href: "/admin/testimonials", label: "Testimonials" },
    { href: "/admin/messages", label: "Contact inbox", badge: unread.total },
    { href: "/admin/pages", label: "SEO" },
    ...(user.role === "admin"
      ? [
          { href: "/admin/settings", label: "Contact info & settings" },
          { href: "/admin/users", label: "Admin users" },
        ]
      : []),
    { href: "/admin/account", label: "My account" },
  ];

  return (
    <div className="flex flex-1 flex-col lg:flex-row">
      <aside className="bg-slate-900 text-white lg:sticky lg:top-0 lg:h-dvh lg:w-64 lg:shrink-0 lg:overflow-y-auto">
        <div className="flex items-center justify-between gap-3 px-5 py-4">
          <Link href="/admin" className="flex items-center gap-2.5 font-bold">
            <LogoMark onDark className="h-8 w-9" />
            Aventra Admin
          </Link>
          <Link href="/" target="_blank" className="text-xs text-white/60 hover:text-white">
            View site ↗
          </Link>
        </div>
        <nav aria-label="Admin">
          <AdminNav items={items} />
        </nav>
        <div className="hidden border-t border-white/10 px-5 py-4 text-sm lg:block">
          <p className="font-semibold">{user.name}</p>
          <p className="truncate text-xs text-white/60">{user.email}</p>
          <form action={logout} className="mt-3">
            <button type="submit" className="text-sm font-semibold text-brand-soft hover:text-white">
              Log out
            </button>
          </form>
        </div>
      </aside>
      <main className="min-w-0 flex-1 px-5 py-7 sm:px-8 lg:py-10">
        <div className="mx-auto max-w-5xl">{children}</div>
        <form action={logout} className="mx-auto mt-10 max-w-5xl lg:hidden">
          <button type="submit" className="text-sm font-semibold text-brand">
            Log out ({user.name})
          </button>
        </form>
      </main>
    </div>
  );
}
