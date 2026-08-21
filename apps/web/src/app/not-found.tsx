import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex max-w-lg flex-col items-center px-6 py-32 text-center">
      <p className="text-sm font-medium text-emerald-400">404</p>
      <h1 className="mt-3 text-2xl font-semibold text-slate-50">
        We couldn&apos;t find that page
      </h1>
      <p className="mt-3 text-sm text-slate-500">
        It may have moved, or the anchor you&apos;re looking for isn&apos;t
        in the directory yet.
      </p>
      <div className="mt-8 flex gap-3">
        <Link
          href="/"
          className="rounded-md bg-slate-100 px-4 py-2 text-sm font-medium text-slate-950 transition hover:bg-white"
        >
          Go home
        </Link>
        <Link
          href="/directory"
          className="rounded-md border border-slate-700 px-4 py-2 text-sm text-slate-300 transition hover:border-slate-600"
        >
          Browse the directory
        </Link>
      </div>
    </main>
  );
}
