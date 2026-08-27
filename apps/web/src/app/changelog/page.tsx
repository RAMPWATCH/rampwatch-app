import type { Metadata } from "next";

export const metadata: Metadata = { title: "Changelog — SEPGATE" };

const ENTRIES = [
  {
    date: "2026-08-21",
    title: "Public directory and on-demand verify page",
    items: [
      "SEP-1/6/10/24/38 checkers with a scheduler that skips SEPs an anchor doesn't declare",
      "Public directory with status/network/ownership/asset filters",
      "Anchor detail pages with 90-day uptime and latency history",
      "Live pricing pulled from platform config, no redeploy required",
    ],
  },
];

export default function ChangelogPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-20">
      <p className="text-sm font-medium text-status-operational">Changelog</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-50">
        What&apos;s shipped
      </h1>
      <div className="mt-10 space-y-10">
        {ENTRIES.map((entry) => (
          <section key={entry.date}>
            <p className="text-xs text-text-tertiary">
              {new Date(entry.date).toLocaleDateString(undefined, {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
            <h2 className="mt-1 text-base font-semibold text-text-primary">{entry.title}</h2>
            <ul className="mt-3 space-y-1.5">
              {entry.items.map((item) => (
                <li key={item} className="flex gap-2 text-sm text-text-secondary">
                  <span className="text-status-operational">+</span>
                  {item}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </main>
  );
}
