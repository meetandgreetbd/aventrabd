import Link from "next/link";
import { asc } from "drizzle-orm";
import { Badge, PageTitle, Table } from "@/components/admin/ui";
import { getDb, schema } from "@/db";
import { requireAdmin } from "@/lib/auth";
import { formatDate } from "@/lib/format";

export const metadata = { title: "Admin users" };

export default async function UsersPage() {
  const current = await requireAdmin();
  const rows = await getDb()
    .select({
      id: schema.users.id,
      name: schema.users.name,
      email: schema.users.email,
      role: schema.users.role,
      createdAt: schema.users.createdAt,
    })
    .from(schema.users)
    .orderBy(asc(schema.users.name));

  return (
    <>
      <PageTitle
        title="Admin users"
        description="Admins can do everything. Editors can manage content but not settings or users."
        action={{ href: "/admin/users/new", label: "New user" }}
      />
      <Table head={["Name", "Email", "Role", "Added"]}>
        {rows.map((user) => (
          <tr key={user.id}>
            <td>
              <Link href={`/admin/users/${user.id}`} className="font-semibold text-violet-700 hover:underline">
                {user.name}
              </Link>
              {user.id === current.id && <span className="ml-2 text-xs text-slate-500">(you)</span>}
            </td>
            <td>{user.email}</td>
            <td>
              <Badge value={user.role} />
            </td>
            <td>{formatDate(user.createdAt)}</td>
          </tr>
        ))}
      </Table>
    </>
  );
}
