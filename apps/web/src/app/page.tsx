import Link from "next/link";
import { getAnchors, getStats } from "@/lib/api";
import { StatusBadge } from "@/components/StatusBadge";

export default async function HomePage() {
  const [stats, anchors] = await Promise.all([getStats(), getAnchors()]);
  const previewAnchors = (anchors ?? []).slice(0, 4);

  return (
    <main>
      <section className="mx-auto max-w-6xl px-6 pb-16 pt-20 sm:pt-28">
        <p className="text-sm font-medium text-emerald-400">
          Independent Stellar anchor monitoring
        </p>
        <h1 className="mt-4 max-w-2xl text-4xl font-semibold tracking-tight text-slate-50 sm:text-5xl">
          SEPGATE checks whether Stellar anchors actually implement SEP
          compliance — not just claim to.
        </h1>
        <p className="mt-6 max-w-xl text-lg text-slate-400">
          We run SEP-1, SEP-6, SEP-10, SEP-24, and SEP-38 checks against
          every anchor on a schedule, for free. Need an answer right now
          instead of waiting for the next cycle? Pay per call over x402 and
          get a fresh result in seconds — no account, no API key.
        </p>

        <form action="/verify" className="mt-10 flex max-w-xl gap-2">
          <input
            type="text"
            name="domain"
            placeholder="anchor-domain.com"
            required
            className="w-full rounded-md border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none"
          />
          <button
            type="submit"
            className="shrink-0 rounded-md bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400"
          >
            Check any anchor
          </button>
        </form>
        <p className="mt-3 text-sm text-slate-500">
          {stats
            ? `${stats.anchorsMonitored} anchor${stats.anchorsMonitored === 1 ? "" : "s"} monitored right now.`
            : "Live anchor count loading."}{" "}
          <Link href="/directory" className="text-slate-300 underline underline-offset-2">
            Browse the directory
          </Link>
        </p>
      </section>

      {previewAnchors.length > 0 && (
        <section className="border-t border-slate-800 bg-slate-900/30">
          <div className="mx-auto max-w-6xl px-6 py-14">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-100">
                Recently checked anchors
              </h2>
              <Link
                href="/directory"
                className="text-sm text-slate-400 transition hover:text-slate-100"
              >
                View all →
              </Link>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {previewAnchors.map((anchor) => (
                <Link
                  key={anchor.slug}
                  href={`/directory/${anchor.slug}`}
                  className="block rounded-lg border border-slate-800 bg-slate-950 p-5 transition hover:border-slate-700"
                >
                  <p className="truncate text-sm font-medium text-slate-100">
                    {anchor.displayName ?? anchor.domain}
                  </p>
                  <p className="mt-1 truncate text-xs text-slate-500">{anchor.domain}</p>
                  <div className="mt-4">
                    <StatusBadge status={anchor.status} />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-8 sm:grid-cols-3">
          <div>
            <p className="text-sm font-medium text-slate-300">Free, on a schedule</p>
            <p className="mt-2 text-sm text-slate-500">
              Every anchor in the directory is re-checked automatically. The
              public directory and status pages are always free to browse.
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-300">Paid, on demand</p>
            <p className="mt-2 text-sm text-slate-500">
              Need a result right now — for an audit, an integration, or an
              autonomous agent deciding which anchor to trust? Pay per call
              over x402, no signup required.
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-300">Built for agents too</p>
            <p className="mt-2 text-sm text-slate-500">
              x402 means AI agents can pay for a check the same way they&apos;d
              call any other API — no human in the loop, no stored
              credentials.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
