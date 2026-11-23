"use client";

import { startTransition, useActionState } from "react";
import { ArrowRight, CircleCheck } from "lucide-react";
import type { FormState } from "@/server/form";

type Props = {
  action: (prev: FormState, data: FormData) => Promise<FormState>;
  children: React.ReactNode;
  submitLabel: string;
  className?: string;
  variant?: "site" | "admin";
  /** Public forms swap to a thank-you panel once the submission is accepted. */
  replaceOnSuccess?: boolean;
};

const submitStyles = {
  site: "btn-brand group inline-flex w-full items-center justify-center gap-2.5 rounded-full px-6 py-3.5 text-sm font-bold text-white transition hover:-translate-y-0.5 disabled:translate-y-0 disabled:opacity-60",
  admin:
    "inline-flex items-center justify-center rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-deep disabled:opacity-60",
};

export function ActionForm({
  action,
  children,
  submitLabel,
  className = "",
  variant = "site",
  replaceOnSuccess = false,
}: Props) {
  const [state, formAction, pending] = useActionState(action, null);

  if (replaceOnSuccess && state?.ok) {
    return (
      <div role="status" className="flex flex-col items-center gap-3 py-10 text-center">
        <CircleCheck className="h-12 w-12 text-brand" />
        <p className="text-lg font-semibold text-ink">{state.ok}</p>
      </div>
    );
  }

  return (
    <form
      className={className}
      // Submitting by hand (instead of <form action>) keeps what the visitor typed
      // when the server returns a validation error; React would otherwise reset the form.
      onSubmit={(event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        startTransition(() => formAction(data));
      }}
    >
      {children}
      {state?.error && (
        <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {state.error}
        </p>
      )}
      {state?.ok && (
        <p role="status" className="rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
          {state.ok}
        </p>
      )}
      <div>
        <button type="submit" disabled={pending} className={submitStyles[variant]}>
          {pending ? "Please wait…" : submitLabel}
          {variant === "site" && !pending && (
            <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
          )}
        </button>
      </div>
    </form>
  );
}
