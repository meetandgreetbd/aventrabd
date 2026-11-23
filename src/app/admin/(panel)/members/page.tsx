import Link from "next/link";
import { asc } from "drizzle-orm";
import { Badge, Empty, PageTitle, Table } from "@/components/admin/ui";
import { getDb, schema } from "@/db";
import { requireUser } from "@/lib/auth";

export const metadata = { title: "Members" };

export default async function MembersPage() {
  await requireUser();
  const rows = await getDb()
    .select()
    .from(schema.members)
    .orderBy(asc(schema.members.group), asc(schema.members.sortOrder), asc(schema.members.id));

  return (
    <>
      <PageTitle
        title="Members"
        description="People shown on the Leadership page."
        action={{ href: "/admin/members/new", label: "New member" }}
      />
      {rows.length === 0 ? (
        <Empty>No members yet. The Leadership page hides the team section until you add someone.</Empty>
      ) : (
        <Table head={["Name", "Title", "Group", "Order", "Visibility"]}>
          {rows.map((member) => (
            <tr key={member.id}>
              <td>
                <Link href={`/admin/members/${member.id}`} className="font-semibold text-violet-700 hover:underline">
                  {member.name}
                </Link>
              </td>
              <td>{member.title}</td>
              <td className="capitalize">{member.group}</td>
              <td>{member.sortOrder}</td>
              <td>
                <Badge value={member.visible ? "visible" : "hidden"} />
              </td>
            </tr>
          ))}
        </Table>
      )}
    </>
  );
}
