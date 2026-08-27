import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "How it works — SEPGATE",
};

function FlowStep({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-5">
      <p className="text-sm font-medium text-slate-100">{title}</p>
      <p className="mt-2 text-sm text-slate-500">{description}</p>
    </div>
  );
}

function Arrow() {
  return (
    <div className="flex items-center justify-center py-1 text-slate-700 sm:rotate-[-90deg]">
      ↓
    </div>
  );
}

export default function HowItWorksPage() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-20">
      <p className="text-sm font-medium text-emerald-400">How it works</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-50">
        Two ways to get a compliance result
      </h1>
      <p className="mt-4 max-w-2xl text-slate-400">
        SEPGATE runs the same underlying checks either way — SEP-1
        stellar.toml validation, SEP-10 challenge verification, SEP-6/24
        endpoint schema checks, and SEP-38 quote validation. The only
        difference is who&apos;s waiting for the answer and how fresh it
        needs to be.
      </p>

      <div className="mt-12 grid gap-8 sm:grid-cols-2">
        <section>
          <h2 className="text-lg font-semibold text-slate-100">
            Scheduled — free, always running
          </h2>
          <div className="mt-4 space-y-1">
            <FlowStep
              title="1. Every anchor in the directory"
              description="Claimed or not, every listed anchor is queued for a check on a fixed interval."
            />
            <Arrow />
            <FlowStep
              title="2. Checks run automatically"
              description="SEP-1 through SEP-38 run in sequence, skipping any SEP the anchor doesn't declare support for."
            />
            <Arrow />
            <FlowStep
              title="3. Result is cached and public"
              description="The directory and status pages always show this cached result — free, fast, no payment required."
            />
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-100">
            On-demand — paid via x402, real-time
          </h2>
          <div className="mt-4 space-y-1">
            <FlowStep
              title="1. Caller requests a fresh check"
              description="A human, a script, or an AI agent hits the paid endpoint for any domain — listed or not."
            />
            <Arrow />
            <FlowStep
              title="2. Server responds 402, caller pays"
              description="The x402 payment header carries a USDC micropayment over Stellar; no account or API key needed."
            />
            <Arrow />
            <FlowStep
              title="3. Check runs live, result returned"
              description="The same check pipeline runs immediately and the response includes a link to verify it independently."
            />
          </div>
        </section>
      </div>

      <section className="mt-16 rounded-lg border border-slate-800 bg-slate-900/40 p-6">
        <h2 className="text-base font-semibold text-slate-100">
          Why not just always check on demand?
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          Constantly re-checking every anchor for every visitor would be
          wasteful and slow. The scheduled layer keeps the public directory
          current for free; the paid layer exists for the moments a cached
          answer isn&apos;t good enough — right before a transfer, during an
          audit, or when an autonomous agent needs a real-time trust signal
          before it acts.
        </p>
      </section>
    </main>
  );
}
