import Link from "next/link";
import { getPricing } from "@/lib/api";

export default async function VerifyPage({
  searchParams,
}: {
  searchParams: Promise<{ domain?: string }>;
}) {
  const { domain } = await searchParams;
  const pricing = await getPricing();

  return (
    <main className="mx-auto max-w-2xl px-6 py-20">
      <p className="text-sm font-medium text-emerald-400">On-demand check</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-50">
        {domain ? (
          <>
            Run a fresh compliance check on{" "}
            <span className="text-emerald-300">{domain}</span>
          </>
        ) : (
          "Run a fresh compliance check on any domain"
        )}
      </h1>
      <p className="mt-4 text-slate-400">
        A fresh check runs SEP-1 through SEP-38 against the domain right now
        — no waiting for the next scheduled cycle — and settles payment over
        the x402 protocol in the same request. It works the same whether
        you&apos;re a human, a script, or an autonomous agent.
      </p>

      <div className="mt-8 rounded-lg border border-slate-800 bg-slate-900/40 p-6">
        <p className="text-sm font-medium text-slate-300">Price for a single check</p>
        <p className="mt-1 text-2xl font-semibold text-slate-50">
          {pricing ? `$${pricing.priceVerifyDomain} ${pricing.asset}` : "—"}
        </p>
        <p className="mt-1 text-xs text-slate-500">
          Billed per call over x402 on {pricing?.network ?? "Stellar"} — no
          account, no API key, no subscription.
        </p>
      </div>

      <div className="mt-8">
        <p className="text-sm font-medium text-slate-300">Call it directly</p>
        <p className="mt-1 text-sm text-slate-500">
          The in-browser checkout is landing alongside the x402 payment
          integration. Until then, this is exactly what it will do under
          the hood:
        </p>
        <pre className="mt-3 overflow-x-auto rounded-lg border border-slate-800 bg-slate-950 p-4 text-xs text-slate-300">
          <code>{`curl -X POST https://api.rampwatch.app/api/v1/x402/verify-domain \\
  -H "Content-Type: application/json" \\
  -d '{"domain": "${domain ?? "anchor-domain.com"}"}'

# -> HTTP 402 Payment Required (x402 challenge)
# pay, retry with the payment header, get back:
# { "checked_at": "...", "check_run_id": "...", "status": "operational" }`}</code>
        </pre>
      </div>

      <p className="mt-8 text-sm text-slate-500">
        Prefer to see what&apos;s already on record?{" "}
        <Link href="/directory" className="text-slate-300 underline underline-offset-2">
          Browse the free directory
        </Link>{" "}
        instead.
      </p>
    </main>
  );
}
