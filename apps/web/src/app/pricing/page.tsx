import type { Metadata } from "next";
import Link from "next/link";
import { getPricing } from "@/lib/api";

export const metadata: Metadata = {
  title: "Pricing — SEPGATE",
};

function PlanCard({
  name,
  price,
  priceNote,
  description,
  features,
  cta,
  ctaHref,
  highlighted = false,
}: {
  name: string;
  price: string;
  priceNote: string;
  description: string;
  features: string[];
  cta: string;
  ctaHref: string;
  highlighted?: boolean;
}) {
  return (
    <div
      className={
        highlighted
          ? "rounded-xl border border-emerald-500/40 bg-emerald-500/[0.03] p-6"
          : "rounded-xl border border-slate-800 bg-slate-900/30 p-6"
      }
    >
      <p className="text-sm font-medium text-slate-300">{name}</p>
      <p className="mt-3 text-3xl font-semibold text-slate-50">{price}</p>
      <p className="mt-1 text-xs text-slate-500">{priceNote}</p>
      <p className="mt-4 text-sm text-slate-400">{description}</p>
      <ul className="mt-6 space-y-2.5">
        {features.map((feature) => (
          <li key={feature} className="flex gap-2 text-sm text-slate-400">
            <span className="text-emerald-400">✓</span>
            {feature}
          </li>
        ))}
      </ul>
      <Link
        href={ctaHref}
        className={
          highlighted
            ? "mt-8 block rounded-md bg-emerald-500 px-4 py-2.5 text-center text-sm font-semibold text-slate-950 transition hover:bg-emerald-400"
            : "mt-8 block rounded-md border border-slate-700 px-4 py-2.5 text-center text-sm font-medium text-slate-200 transition hover:border-slate-600"
        }
      >
        {cta}
      </Link>
    </div>
  );
}

export default async function PricingPage() {
  const pricing = await getPricing();

  return (
    <main className="mx-auto max-w-5xl px-6 py-20">
      <p className="text-sm font-medium text-emerald-400">Pricing</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-50">
        Free to browse. Pay only for a fresh answer.
      </h1>
      <p className="mt-4 max-w-2xl text-slate-400">
        The public directory is never gated behind payment — only on-demand,
        live checks are. Prices below are live from the platform config.
      </p>

      <div className="mt-12 grid gap-6 sm:grid-cols-3">
        <PlanCard
          name="Free"
          price="$0"
          priceNote="forever"
          description="Browse every anchor's cached compliance status, updated on a fixed schedule."
          features={[
            "Full public directory",
            "90-day uptime & latency history",
            "SEP-by-SEP breakdown per anchor",
            "Read-only public REST API",
          ]}
          cta="Browse the directory"
          ctaHref="/directory"
        />
        <PlanCard
          name="Operator Pro"
          price="$0"
          priceNote="claim your anchor, free"
          description="Claim your own anchor's listing to see deeper history and get alerted when something breaks."
          features={[
            "Everything in Free",
            "Full (unwindowed) check history",
            "Email & webhook alerts",
            "Domain ownership verification",
          ]}
          cta="Claim your anchor"
          ctaHref="/signup"
          highlighted
        />
        <PlanCard
          name="Pay-per-call"
          price={pricing ? `$${pricing.priceVerifyDomain}` : "—"}
          priceNote={`per verify-domain call · ${pricing?.asset ?? "USDC"} over x402`}
          description="Run a live check on any domain right now, listed or not — built for humans, scripts, and AI agents alike."
          features={[
            pricing ? `$${pricing.priceCheck} — recheck a listed anchor` : "Recheck a listed anchor",
            pricing ? `$${pricing.priceVerifyDomain} — verify any domain` : "Verify any domain",
            pricing ? `$${pricing.priceFullReport} — full 5-SEP report` : "Full 5-SEP report",
            "No account, no API key, no subscription",
          ]}
          cta="Run a check"
          ctaHref="/verify"
        />
      </div>

      <p className="mt-10 text-sm text-slate-500">
        Building an integration or an agent that needs to call these
        directly?{" "}
        <Link href="/docs" className="text-slate-300 underline underline-offset-2">
          Read the API docs
        </Link>
        .
      </p>
    </main>
  );
}
