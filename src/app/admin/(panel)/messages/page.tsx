import { desc } from "drizzle-orm";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { Badge, Empty, PageTitle } from "@/components/admin/ui";
import { getDb, schema } from "@/db";
import { requireUser } from "@/lib/auth";
import { formatDateTime } from "@/lib/format";
import { deleteMessage, setMessageRead } from "@/server/actions/content";

export const metadata = { title: "Contact inbox" };

export default async function MessagesPage() {
  await requireUser();
  const rows = await getDb()
    .select()
    .from(schema.messages)
    .orderBy(desc(schema.messages.createdAt))
    .limit(500);

  return (
    <>
      <PageTitle title="Contact inbox" description="Messages sent through the Contact page, newest first." />
      {rows.length === 0 ? (
        <Empty>No messages yet.</Empty>
      ) : (
        <ul className="space-y-4">
          {rows.map((message) => (
            <li
              key={message.id}
              className={`rounded-xl border bg-white p-5 shadow-sm ${message.isRead ? "border-slate-200" : "border-brand-soft"}`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-bold text-slate-900">
                    {message.name} {!message.isRead && <Badge value="unread" />}
                  </p>
                  <a href={`mailto:${message.email}`} className="text-sm text-brand hover:underline">
                    {message.email}
                  </a>
                </div>
                <time className="text-xs text-slate-500">{formatDateTime(message.createdAt)}</time>
              </div>
              <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-slate-700">
                {message.message}
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <form action={setMessageRead.bind(null, message.id, !message.isRead)}>
                  <button
                    type="submit"
                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    {message.isRead ? "Mark as unread" : "Mark as read"}
                  </button>
                </form>
                <ConfirmButton action={deleteMessage.bind(null, message.id)} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
