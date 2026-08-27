import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAnchorDetail } from "@/lib/api";
import { StatusBadge } from "@/components/StatusBadge";
import { SepCheckRow } from "@/components/SepCheckRow";
import { UptimeStrip } from "@/components/UptimeStrip";
import { LatencyChart } from "@/components/LatencyChart";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const anchor = await getAnchorDetail(slug);
  return { title: anchor ? `${anchor.displayName ?? anchor.domain} — SEPGATE` : "SEPGATE" };
}

export default async function AnchorDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const anchor = await getAnchorDetail(slug);

  if (!anchor) {
    notFound();
  }

  const latestStatus = anchor.uptimeHistory[0]?.status ?? null;
  const uptimePercent =
    anchor.uptimeHistory.length > 0
      ? Math.round(
          (anchor.uptimeHistory.filter((entry) => entry.status === "operational").length /
            anchor.uptimeHistory.length) *
            1000,
        ) / 10
      : null;

  return (
    <main className="mx-auto max-w-4xl px-6 py-16">
      <Link href="/directory" className="text-sm text-text-secondary hover:text-text-primary">
        ← Back to directory
      </Link>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-50">
            {anchor.displayName ?? anchor.domain}
          </h1>
          <p className="mt-1 text-sm text-text-secondary">{anchor.domain}</p>
          <div className="mt-3 flex items-center gap-3">
            <StatusBadge status={latestStatus} />
            <span className="rounded-full border border-border-subtle px-2 py-0.5 text-[10px] uppercase tracking-wide text-text-secondary">
              {anchor.network}
            </span>
            {anchor.claimStatus === "claimed" && (
              <span className="text-xs text-text-secondary">Claimed by operator</span>
            )}
          </div>
        </div>
        <Link
          href={`/verify?domain=${encodeURIComponent(anchor.domain)}`}
          className="shrink-0 rounded-md bg-status-operational px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-status-operational"
        >
          Run a fresh check
        </Link>
      </div>

      <section className="mt-10 rounded-lg border border-border-subtle bg-bg-secondary/30 p-6">
        <div className="flex items-baseline justify-between">
          <h2 className="text-sm font-medium text-text-primary">
            90-day uptime{uptimePercent !== null ? ` — ${uptimePercent}% operational` : ""}
          </h2>
          <span className="text-xs text-text-tertiary">
            {anchor.uptimeHistory.length} checks in this window
          </span>
        </div>
        <div className="mt-4">
          {anchor.uptimeHistory.length > 0 ? (
            <UptimeStrip history={anchor.uptimeHistory} />
          ) : (
            <p className="text-sm text-text-secondary">No checks recorded yet.</p>
          )}
        </div>
      </section>

      <section className="mt-6 rounded-lg border border-border-subtle bg-bg-secondary/30 p-6">
        <LatencyChart history={anchor.uptimeHistory} />
      </section>

      <section className="mt-6 rounded-lg border border-border-subtle bg-bg-secondary/30 p-6">
        <h2 className="text-sm font-medium text-text-primary">Latest SEP breakdown</h2>
        <div className="mt-3">
          {anchor.latestSepResults.length > 0 ? (
            anchor.latestSepResults.map((result) => (
              <SepCheckRow key={result.sepType} result={result} />
            ))
          ) : (
            <p className="text-sm text-text-secondary">No check results yet.</p>
          )}
        </div>
      </section>
    </main>
  );
}
