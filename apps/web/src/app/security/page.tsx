import type { Metadata } from "next";

export const metadata: Metadata = { title: "Security — SEPGATE" };

const SECTIONS = [
  {
    title: "We never sign or submit transactions",
    body: "Every check SEPGATE runs — including SEP-10 authentication — is read-only verification. We request a challenge, verify it was signed by the anchor's declared key using the official Stellar SDK, and stop there. We never hold a funded keypair on your behalf and never submit anything to the network.",
  },
  {
    title: "No custody, ever",
    body: "SEPGATE doesn't touch anchor funds, doesn't hold user balances, and doesn't act as a money transmitter. Payment for on-demand checks flows anchor-to-us over x402 for the check itself, never through us to a third party.",
  },
  {
    title: "Independent, not affiliated",
    body: "SEPGATE is an independent monitor. We are not affiliated with the Stellar Development Foundation, and a listing in our directory is not an endorsement — it's a report of what we observed at a given time.",
  },
  {
    title: "Reporting a problem",
    body: "If you find a vulnerability or a check that misrepresents an anchor's compliance, please reach out — see the contact page.",
  },
];

export default function SecurityPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-20">
      <p className="text-sm font-medium text-emerald-400">Security</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-50">
        What SEPGATE does — and deliberately doesn&apos;t do
      </h1>
      <div className="mt-10 space-y-8">
        {SECTIONS.map((section) => (
          <section key={section.title}>
            <h2 className="text-base font-semibold text-slate-100">{section.title}</h2>
            <p className="mt-2 text-sm text-slate-400">{section.body}</p>
          </section>
        ))}
      </div>
    </main>
  );
}
