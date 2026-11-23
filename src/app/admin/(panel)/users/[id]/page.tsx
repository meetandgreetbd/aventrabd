import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { Card, Field, PageTitle, Select, parseId } from "@/components/admin/ui";
import { ActionForm } from "@/components/forms/ActionForm";
import { getDb, schema } from "@/db";
import { requireAdmin } from "@/lib/auth";
import { deleteUser, saveUser } from "@/server/actions/users";

export const metadata = { title: "User" };

export default async function UserEditPage({ params }: { params: Promise<{ id: string }> }) {
  const current = await requireAdmin();
  const id = parseId((await params).id);
  const user =
    id === null
      ? undefined
      : (await getDb().select().from(schema.users).where(eq(schema.users.id, id)).limit(1))[0];
  if (id !== null && !user) notFound();

  return (
    <>
      <PageTitle title={user ? user.name : "New user"} back={{ href: "/admin/users", label: "Admin users" }} />
      <ActionForm action={saveUser.bind(null, id)} submitLabel="Save user" variant="admin" className="space-y-5">
        <Card>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Name" name="name" required defaultValue={user?.name} maxLength={120} />
            <Field label="Email" name="email" type="email" required defaultValue={user?.email} autoComplete="off" />
            <Select
              label="Role"
              name="role"
              defaultValue={user?.role ?? "editor"}
              options={[
                { value: "editor", label: "Editor — manages content" },
                { value: "admin", label: "Admin — full access" },
              ]}
            />
            <Field
              label={user ? "New password" : "Password"}
              name="password"
              type="password"
              required={!user}
              autoComplete="new-password"
              hint={
                user
                  ? "Leave empty to keep the current password. Setting one logs this user out everywhere."
                  : "At least 10 characters. Share it with the user privately."
              }
            />
          </div>
        </Card>
      </ActionForm>

      {user && user.id !== current.id && (
        <div className="mt-8 flex justify-end">
          <ConfirmButton action={deleteUser.bind(null, user.id)} label="Delete user" />
        </div>
      )}
    </>
  );
}
