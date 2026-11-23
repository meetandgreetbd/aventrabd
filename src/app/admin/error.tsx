"use client";

export default function AdminError({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-24 text-center">
      <h1 className="text-2xl font-bold">Something went wrong</h1>
      <p className="mt-3 max-w-md text-sm text-slate-600">
        The admin panel could not complete that request. If this keeps happening, check that the MySQL
        database is running and that DATABASE_URL is correct, then try again.
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-6 rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-deep"
      >
        Try again
      </button>
    </main>
  );
}
