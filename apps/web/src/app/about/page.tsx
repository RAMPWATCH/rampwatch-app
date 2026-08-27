import type { Metadata } from "next";

export const metadata: Metadata = { title: "About — SEPGATE" };

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-20">
      <p className="text-sm font-medium text-emerald-400">About</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-50">
        SEP compliance is a claim. SEPGATE checks it.
      </h1>
      <div className="mt-8 space-y-6 text-slate-400">
        <p>
          A Stellar anchor&apos;s stellar.toml can say it supports SEP-6, SEP-24,
          or SEP-38 — but whether those endpoints actually work, respond
          correctly, and stay up is a separate question nobody was
          continuously answering. SEPGATE runs the real SEP-1, SEP-6,
          SEP-10, SEP-24, and SEP-38 checks against every anchor it knows
          about, on a schedule, and publishes what it finds.
        </p>
        <p>
          The same checks are available on demand, priced per call and paid
          for over the x402 protocol, so anyone — a wallet deciding which
          anchor to route through, an auditor, or an autonomous agent —
          can get a live answer without an account or an API key.
        </p>
        <p>
          SEPGATE is independently operated and not affiliated with the
          Stellar Development Foundation or any anchor it monitors.
        </p>
      </div>
    </main>
  );
}
