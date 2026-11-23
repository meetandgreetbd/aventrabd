import { Card, Field, PageTitle, TextArea } from "@/components/admin/ui";
import { ActionForm } from "@/components/forms/ActionForm";
import { requireAdmin } from "@/lib/auth";
import { getSettings } from "@/lib/cms";
import { saveSettings } from "@/server/actions/content";

export const metadata = { title: "Settings" };

export default async function SettingsPage() {
  await requireAdmin();
  const settings = await getSettings();
  const emailReady = Boolean(process.env.RESEND_API_KEY);

  return (
    <>
      <PageTitle
        title="Contact info & settings"
        description="Shown on the Contact page and in the footer of every page."
      />
      <ActionForm action={saveSettings} submitLabel="Save settings" variant="admin" className="space-y-5">
        <Card title="Contact information">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Phone" name="phone" defaultValue={settings.phone} maxLength={40} />
            <Field label="Public email" name="email" type="email" defaultValue={settings.email} />
          </div>
          <TextArea label="Address" name="address" rows={2} defaultValue={settings.address} maxLength={300} />
        </Card>

        <Card title="Social links" description="Leave a link empty to hide its icon.">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="LinkedIn" name="linkedin" type="url" defaultValue={settings.linkedin} />
            <Field label="Facebook" name="facebook" type="url" defaultValue={settings.facebook} />
            <Field label="YouTube" name="youtube" type="url" defaultValue={settings.youtube} />
            <Field label="X" name="x" type="url" defaultValue={settings.x} />
          </div>
        </Card>

        <Card
          title="Email notifications"
          description={
            emailReady
              ? "Choose who is emailed when something new arrives. Everything is always saved in the admin as well."
              : "Email sending is not configured on the server yet (RESEND_API_KEY is missing), so nothing is emailed. Everything is still saved in the admin."
          }
        >
          <Field
            label="Contact messages go to"
            name="contactNotifyEmail"
            defaultValue={settings.contactNotifyEmail}
            maxLength={300}
            hint="Who receives a new message from the Contact page. Several addresses can be separated by commas. Leave empty to turn off."
          />
          <Field
            label="Job applications go to"
            name="applicationNotifyEmail"
            defaultValue={settings.applicationNotifyEmail}
            maxLength={300}
            hint="Who receives a new job application. Several addresses can be separated by commas. Leave empty to turn off."
          />
        </Card>

        <Card
          title="Google tracking"
          description="Added to every public page (never to the admin). Use Tag Manager or Analytics; if you load Analytics through Tag Manager, fill in only the Tag Manager ID so visits are not counted twice."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Google Tag Manager container ID"
              name="gtmId"
              defaultValue={settings.gtmId}
              maxLength={20}
              hint="Looks like GTM-XXXXXXX. Leave empty if not used."
            />
            <Field
              label="Google Analytics measurement ID"
              name="gaId"
              defaultValue={settings.gaId}
              maxLength={20}
              hint="Looks like G-XXXXXXXXXX. Leave empty if not used."
            />
          </div>
        </Card>

        <Card title="Site details">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Site name"
              name="siteName"
              required
              defaultValue={settings.siteName}
              maxLength={80}
              hint="Shown in the footer and after page titles, for example: About | Aventra"
            />
            <Field label="Footer tagline" name="tagline" defaultValue={settings.tagline} maxLength={160} />
          </div>
        </Card>
      </ActionForm>
    </>
  );
}
