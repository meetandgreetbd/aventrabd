"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";

function Buttons({ label, confirmLabel }: { label: string; confirmLabel: string }) {
  const [armed, setArmed] = useState(false);
  const { pending } = useFormStatus();
  if (!armed) {
    return (
      <button
        type="button"
        onClick={() => setArmed(true)}
        className="rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50"
      >
        {label}
      </button>
    );
  }
  return (
    <span className="inline-flex items-center gap-2">
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-60"
      >
        {pending ? "Deleting…" : confirmLabel}
      </button>
      <button
        type="button"
        onClick={() => setArmed(false)}
        className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100"
      >
        Cancel
      </button>
    </span>
  );
}

/** Two-step delete: the first click arms the button, the second one runs the server action. */
export function ConfirmButton({
  action,
  label = "Delete",
  confirmLabel = "Yes, delete",
}: {
  action: () => Promise<void>;
  label?: string;
  confirmLabel?: string;
}) {
  return (
    <form action={action} className="inline">
      <Buttons label={label} confirmLabel={confirmLabel} />
    </form>
  );
}
