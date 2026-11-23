"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { Check, Trash2, X } from "lucide-react";

const iconButton = "flex h-9 w-9 items-center justify-center rounded-lg transition disabled:opacity-60";

function Buttons({ label, confirmLabel, iconOnly }: { label: string; confirmLabel: string; iconOnly: boolean }) {
  const [armed, setArmed] = useState(false);
  const { pending } = useFormStatus();

  if (iconOnly) {
    // Icon version for table rows. Every button keeps a text label for screen readers and a tooltip.
    if (!armed) {
      return (
        <button
          type="button"
          onClick={() => setArmed(true)}
          aria-label={label}
          title={label}
          className={`${iconButton} border border-red-200 text-red-600 hover:bg-red-50`}
        >
          <Trash2 className="h-4 w-4" />
        </button>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5">
        <button
          type="submit"
          disabled={pending}
          aria-label={confirmLabel}
          title={confirmLabel}
          className={`${iconButton} bg-red-600 text-white hover:bg-red-700`}
        >
          <Check className="h-4 w-4" strokeWidth={3} />
        </button>
        <button
          type="button"
          onClick={() => setArmed(false)}
          aria-label="Cancel"
          title="Cancel"
          className={`${iconButton} border border-slate-300 text-slate-600 hover:bg-slate-100`}
        >
          <X className="h-4 w-4" />
        </button>
      </span>
    );
  }

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

/**
 * Two-step delete: the first click arms the button, the second one runs the server action.
 * With `iconOnly` it shows a bin icon, then a tick (confirm) and a cross (cancel).
 */
export function ConfirmButton({
  action,
  label = "Delete",
  confirmLabel = "Yes, delete",
  iconOnly = false,
}: {
  action: () => Promise<void>;
  label?: string;
  confirmLabel?: string;
  iconOnly?: boolean;
}) {
  return (
    <form action={action} className="inline">
      <Buttons label={label} confirmLabel={confirmLabel} iconOnly={iconOnly} />
    </form>
  );
}
