import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { Card, Checkbox, Field, PageTitle, TextArea, parseId } from "@/components/admin/ui";
import { ActionForm } from "@/components/forms/ActionForm";
import { getDb, schema } from "@/db";
import { requireUser } from "@/lib/auth";
import { deleteTestimonial, saveTestimonial } from "@/server/actions/content";

export const metadata = { title: "Testimonial" };

export default async function TestimonialEditPage({ params }: { params: Promise<{ id: string }> }) {
  await requireUser();
  const id = parseId((await params).id);
  const item =
    id === null
      ? undefined
      : (
          await getDb().select().from(schema.testimonials).where(eq(schema.testimonials.id, id)).limit(1)
        )[0];
  if (id !== null && !item) notFound();

  return (
    <>
      <PageTitle
        title={item ? "Edit testimonial" : "New testimonial"}
        back={{ href: "/admin/testimonials", label: "Testimonials" }}
      />
      <ActionForm
        action={saveTestimonial.bind(null, id)}
        submitLabel="Save testimonial"
        variant="admin"
        className="space-y-5"
      >
        <Card>
          <TextArea
            label="Quote"
            name="quote"
            rows={4}
            required
            defaultValue={item?.quote}
            hint="Without quotation marks; the site adds them."
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Author" name="author" required defaultValue={item?.author} maxLength={120} />
            <Field label="Role" name="role" defaultValue={item?.role} maxLength={160} hint="Optional." />
            <Field
              label="Display order"
              name="sortOrder"
              type="number"
              defaultValue={item?.sortOrder ?? 0}
              hint="Lower numbers appear first."
            />
          </div>
          <Checkbox label="Show on the website" name="visible" defaultChecked={item?.visible ?? true} />
        </Card>
      </ActionForm>

      {item && (
        <div className="mt-8 flex justify-end">
          <ConfirmButton action={deleteTestimonial.bind(null, item.id)} label="Delete testimonial" />
        </div>
      )}
    </>
  );
}
