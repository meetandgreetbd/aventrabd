import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { Card, Checkbox, Field, PageTitle, Select, TextArea, parseId } from "@/components/admin/ui";
import { ActionForm } from "@/components/forms/ActionForm";
import { getDb, schema } from "@/db";
import { requireUser } from "@/lib/auth";
import { mediaUrl } from "@/lib/seo";
import { deleteMember, saveMember } from "@/server/actions/content";

export const metadata = { title: "Member" };

export default async function MemberEditPage({ params }: { params: Promise<{ id: string }> }) {
  await requireUser();
  const id = parseId((await params).id);
  const member =
    id === null
      ? undefined
      : (await getDb().select().from(schema.members).where(eq(schema.members.id, id)).limit(1))[0];
  if (id !== null && !member) notFound();

  return (
    <>
      <PageTitle
        title={member ? member.name : "New member"}
        back={{ href: "/admin/members", label: "Members" }}
      />
      <ActionForm action={saveMember.bind(null, id)} submitLabel="Save member" variant="admin" className="space-y-5">
        <Card>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Name" name="name" required defaultValue={member?.name} maxLength={120} />
            <Field
              label="Job title"
              name="title"
              required
              defaultValue={member?.title}
              maxLength={160}
              hint="For example: Chief Executive Officer"
            />
            <Select
              label="Group"
              name="group"
              defaultValue={member?.group ?? "leadership"}
              options={[
                { value: "leadership", label: "Leadership" },
                { value: "team", label: "Team" },
              ]}
            />
            <Field
              label="Display order"
              name="sortOrder"
              type="number"
              defaultValue={member?.sortOrder ?? 0}
              hint="Lower numbers appear first."
            />
          </div>
          <TextArea label="Short bio" name="bio" rows={4} defaultValue={member?.bio} hint="Optional." />
          {member?.photo && (
            <div className="flex items-center gap-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={mediaUrl(member.photo)}
                alt={`Current photo of ${member.name}`}
                className="h-20 w-20 rounded-full object-cover"
              />
              <Checkbox label="Remove current photo" name="removePhoto" />
            </div>
          )}
          <Field
            label={member?.photo ? "Replace photo" : "Photo"}
            name="photo"
            type="file"
            accept=".jpg,.jpeg,.png,.webp"
            hint="Square JPG, PNG or WebP, up to 4 MB. Optional."
          />
          <Checkbox
            label="Show on the website"
            name="visible"
            defaultChecked={member?.visible ?? true}
          />
        </Card>
      </ActionForm>

      {member && (
        <div className="mt-8 flex justify-end">
          <ConfirmButton action={deleteMember.bind(null, member.id)} label="Delete member" />
        </div>
      )}
    </>
  );
}
