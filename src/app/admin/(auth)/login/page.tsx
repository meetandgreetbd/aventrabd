import { redirect } from "next/navigation";
import { Field } from "@/components/admin/ui";
import { ActionForm } from "@/components/forms/ActionForm";
import { ensureDefaultAdmin, getCurrentUser } from "@/lib/auth";
import { login } from "@/server/actions/auth";

export const metadata = { title: "Log in" };

export default async function LoginPage() {
  if (await getCurrentUser()) redirect("/admin");
  await ensureDefaultAdmin();

  return (
    <>
      <h1 className="mt-4 text-center text-xl font-bold">Aventra Admin</h1>
      <ActionForm action={login} submitLabel="Log in" variant="admin" className="mt-6 space-y-4">
        <Field label="Email" name="email" type="email" required autoComplete="username" />
        <Field label="Password" name="password" type="password" required autoComplete="current-password" />
      </ActionForm>
    </>
  );
}
