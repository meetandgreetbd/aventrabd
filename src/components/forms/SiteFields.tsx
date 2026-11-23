const control =
  "mt-1.5 w-full rounded-2xl border border-white/80 bg-white/70 px-4 py-3 text-sm text-ink shadow-inner outline-none transition placeholder:text-ink-soft/60 focus:border-violet-400 focus:ring-2 focus:ring-violet-300/60";

type FieldProps = {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  autoComplete?: string;
  rows?: number;
  hint?: string;
  accept?: string;
};

export function SiteField({ label, name, type = "text", required, autoComplete, rows, hint, accept }: FieldProps) {
  const id = `field-${name}`;
  return (
    <div>
      <label htmlFor={id} className="text-sm font-semibold text-ink">
        {label}
        {required && <span className="text-brand"> *</span>}
      </label>
      {rows ? (
        <textarea id={id} name={name} rows={rows} required={required} className={`${control} resize-y`} />
      ) : (
        <input
          id={id}
          name={name}
          type={type}
          required={required}
          autoComplete={autoComplete}
          accept={accept}
          aria-describedby={hint ? `${id}-hint` : undefined}
          className={
            type === "file"
              ? `${control} file:mr-3 file:rounded-full file:border-0 file:bg-violet-100 file:px-4 file:py-1.5 file:text-sm file:font-semibold file:text-brand`
              : control
          }
        />
      )}
      {hint && (
        <p id={`${id}-hint`} className="mt-1.5 text-xs text-ink-soft">
          {hint}
        </p>
      )}
    </div>
  );
}

/** Invisible to people; bots that fill every field reveal themselves by completing it. */
export function Honeypot() {
  return (
    <div className="hidden" aria-hidden="true">
      <label>
        Company
        <input name="company" type="text" tabIndex={-1} autoComplete="off" />
      </label>
    </div>
  );
}
