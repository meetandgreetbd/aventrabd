import { Card, Field, PageTitle } from "@/components/admin/ui";
import { ActionForm } from "@/components/forms/ActionForm";
import { requireUser } from "@/lib/auth";
import { changePassword } from "@/server/actions/users";

export const metadata = { title: "My account" };

export default async function AccountPage() {
  const user = await requireUser();
  return (
    <>
      <PageTitle title="My account" description={`${user.name} · ${user.email} · ${user.role}`} />
      <ActionForm action={changePassword} submitLabel="Change password" variant="admin" className="max-w-md space-y-5">
        <Card title="Change password">
          <Field
            label="Current password"
            name="currentPassword"
            type="password"
            required
            autoComplete="current-password"
          />
          <Field
            label="New password"
            name="newPassword"
            type="password"
            required
            autoComplete="new-password"
            hint="At least 10 characters."
          />
          <Field
            label="Repeat new password"
            name="confirmPassword"
            type="password"
            required
            autoComplete="new-password"
          />
        </Card>
      </ActionForm>
    </>
  );
}
