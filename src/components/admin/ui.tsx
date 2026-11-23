import Link from "next/link";
import { notFound } from "next/navigation";
import { Download, Eye, Pencil } from "lucide-react";
import { ConfirmButton } from "./ConfirmButton";

const control =
  "mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-brand-bright focus:ring-2 focus:ring-brand-light";

type BaseProps = { label: string; name: string; hint?: string; required?: boolean };

function Label({ label, name, required }: BaseProps) {
  return (
    <label htmlFor={`f-${name}`} className="text-sm font-semibold text-slate-800">
      {label}
      {required && <span className="text-brand"> *</span>}
    </label>
  );
}

function Hint({ name, hint }: { name: string; hint?: string }) {
  if (!hint) return null;
  return (
    <p id={`f-${name}-hint`} className="mt-1 text-xs text-slate-500">
      {hint}
    </p>
  );
}

export function Field({
  type = "text",
  defaultValue,
  maxLength,
  autoComplete,
  accept,
  ...base
}: BaseProps & {
  type?: string;
  defaultValue?: string | number;
  maxLength?: number;
  autoComplete?: string;
  accept?: string;
}) {
  return (
    <div>
      <Label {...base} />
      <input
        id={`f-${base.name}`}
        name={base.name}
        type={type}
        required={base.required}
        defaultValue={defaultValue}
        maxLength={maxLength}
        autoComplete={autoComplete}
        accept={accept}
        aria-describedby={base.hint ? `f-${base.name}-hint` : undefined}
        className={control}
      />
      <Hint name={base.name} hint={base.hint} />
    </div>
  );
}

export function TextArea({
  defaultValue,
  rows = 4,
  maxLength,
  ...base
}: BaseProps & { defaultValue?: string; rows?: number; maxLength?: number }) {
  return (
    <div>
      <Label {...base} />
      <textarea
        id={`f-${base.name}`}
        name={base.name}
        rows={rows}
        required={base.required}
        defaultValue={defaultValue}
        maxLength={maxLength}
        aria-describedby={base.hint ? `f-${base.name}-hint` : undefined}
        className={`${control} resize-y`}
      />
      <Hint name={base.name} hint={base.hint} />
    </div>
  );
}

export function Select({
  options,
  defaultValue,
  ...base
}: BaseProps & { options: { value: string; label: string }[]; defaultValue?: string }) {
  return (
    <div>
      <Label {...base} />
      <select id={`f-${base.name}`} name={base.name} defaultValue={defaultValue} className={control}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <Hint name={base.name} hint={base.hint} />
    </div>
  );
}

export function Checkbox({
  label,
  name,
  defaultChecked,
  hint,
}: {
  label: string;
  name: string;
  defaultChecked?: boolean;
  hint?: string;
}) {
  return (
    <div>
      <label className="flex items-center gap-2.5 text-sm font-semibold text-slate-800">
        <input
          type="checkbox"
          name={name}
          defaultChecked={defaultChecked}
          className="h-4 w-4 rounded border-slate-300 accent-brand"
        />
        {label}
      </label>
      {hint && <p className="mt-1 pl-6.5 text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

export function SeoFields({
  seoTitle,
  seoDescription,
  noindex,
  fallbackTitle,
}: {
  seoTitle: string;
  seoDescription: string;
  noindex: boolean;
  fallbackTitle: string;
}) {
  return (
    <Card title="SEO" description="Controls how this page appears in Google and when shared.">
      <Field
        label="Meta title"
        name="seoTitle"
        defaultValue={seoTitle}
        maxLength={200}
        hint={`Aim for 50–60 characters. Leave empty to use "${fallbackTitle}".`}
      />
      <TextArea
        label="Meta description"
        name="seoDescription"
        defaultValue={seoDescription}
        rows={3}
        maxLength={320}
        hint="Aim for 120–160 characters. Leave empty to use the default description."
      />
      <Checkbox
        label="Hide from search engines (noindex)"
        name="noindex"
        defaultChecked={noindex}
        hint="Ticked: search engines are told not to list this page, and it is left out of the sitemap."
      />
    </Card>
  );
}

export function Card({
  title,
  description,
  children,
}: {
  title?: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      {title && <h2 className="text-base font-bold text-slate-900">{title}</h2>}
      {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
      <div className={`space-y-4 ${title ? "mt-4" : ""}`}>{children}</div>
    </section>
  );
}

export function PageTitle({
  title,
  description,
  action,
  back,
}: {
  title: string;
  description?: string;
  action?: { href: string; label: string };
  back?: { href: string; label: string };
}) {
  return (
    <div className="mb-6">
      {back && (
        <Link href={back.href} className="text-sm font-medium text-brand hover:underline">
          ← {back.label}
        </Link>
      )}
      <div className="mt-1 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">{title}</h1>
          {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
        </div>
        {action && (
          <Link
            href={action.href}
            className="rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-deep"
          >
            {action.label}
          </Link>
        )}
      </div>
    </div>
  );
}

const badgeTones: Record<string, string> = {
  open: "bg-emerald-100 text-emerald-800",
  shortlisted: "bg-emerald-100 text-emerald-800",
  visible: "bg-emerald-100 text-emerald-800",
  admin: "bg-brand-pale text-brand-deep",
  new: "bg-brand-pale text-brand-deep",
  unread: "bg-brand-pale text-brand-deep",
  draft: "bg-amber-100 text-amber-800",
  reviewed: "bg-sky-100 text-sky-800",
  closed: "bg-slate-200 text-slate-700",
  hidden: "bg-slate-200 text-slate-700",
  rejected: "bg-red-100 text-red-800",
  noindex: "bg-red-100 text-red-800",
};

export function Badge({ value }: { value: string }) {
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${badgeTones[value] ?? "bg-slate-100 text-slate-700"}`}
    >
      {value}
    </span>
  );
}

export function Table({ head, children }: { head: string[]; children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
      <table className="w-full min-w-[36rem] text-left text-sm">
        <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
          <tr>
            {head.map((label) => (
              <th key={label} scope="col" className="px-4 py-3 font-semibold">
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 [&_td]:px-4 [&_td]:py-3">{children}</tbody>
      </table>
    </div>
  );
}

export function Empty({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center text-sm text-slate-500">
      {children}
    </p>
  );
}

/** Route param for edit pages: "new" means create, otherwise it must be a positive integer id. */
export function parseId(value: string): number | null {
  if (value === "new") return null;
  if (!/^\d{1,9}$/.test(value)) notFound();
  return Number(value);
}

/** Icon buttons at the end of a table row: view (eye), edit (pencil) and delete (bin, with a confirm step). */
export function RowActions({
  view,
  edit,
  download,
  onDelete,
}: {
  view?: { href: string; label?: string; newTab?: boolean };
  edit?: string;
  download?: { href: string; label?: string };
  onDelete?: () => Promise<void>;
}) {
  const link =
    "flex h-9 w-9 items-center justify-center rounded-lg border border-slate-300 text-slate-600 transition hover:border-brand hover:bg-brand-pale hover:text-brand";
  return (
    <div className="flex items-center gap-1.5">
      {view && (
        <Link
          href={view.href}
          target={view.newTab ? "_blank" : undefined}
          aria-label={view.label ?? "View"}
          title={view.label ?? "View"}
          className={link}
        >
          <Eye className="h-4 w-4" />
        </Link>
      )}
      {edit && (
        <Link href={edit} aria-label="Edit" title="Edit" className={link}>
          <Pencil className="h-4 w-4" />
        </Link>
      )}
      {download && (
        <a href={download.href} aria-label={download.label ?? "Download"} title={download.label ?? "Download"} className={link}>
          <Download className="h-4 w-4" />
        </a>
      )}
      {onDelete && <ConfirmButton action={onDelete} iconOnly />}
    </div>
  );
}
