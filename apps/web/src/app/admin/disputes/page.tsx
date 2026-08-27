import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Disputes — SEPGATE Admin",
};

export default async function AdminDisputesPage() {
  return (
    <main className="min-h-screen bg-bg-primary text-text-primary">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="mb-8">
          <Link href="/admin" className="text-sm text-text-secondary hover:text-text-primary">
            ← Back to admin
          </Link>
          <h1 className="mt-4 text-3xl font-bold">Disputes</h1>
          <p className="mt-2 text-text-secondary">
            View all raised disputes. No automated resolution — all disputes resolved
            manually off-chain
          </p>
        </div>

        <div className="space-y-6">
          <div className="grid gap-6 sm:grid-cols-3">
            <div className="rounded-lg border border-border-subtle bg-bg-secondary/30 p-6">
              <p className="text-xs text-text-tertiary">Open Disputes</p>
              <p className="mt-2 text-3xl font-bold text-status-degraded">0</p>
            </div>
            <div className="rounded-lg border border-border-subtle bg-bg-secondary/30 p-6">
              <p className="text-xs text-text-tertiary">Resolved This Month</p>
              <p className="mt-2 text-3xl font-bold text-text-primary">0</p>
            </div>
            <div className="rounded-lg border border-border-subtle bg-bg-secondary/30 p-6">
              <p className="text-xs text-text-tertiary">Funds Held in Disputes</p>
              <p className="mt-2 text-3xl font-bold text-text-primary">$0 USDC</p>
            </div>
          </div>

          <div className="rounded-lg border border-border-subtle bg-bg-secondary/30 p-6">
            <h2 className="text-lg font-semibold text-text-primary">Process</h2>
            <ol className="mt-4 space-y-2 text-sm text-text-secondary">
              <li>1. Buyer or provider raises dispute on-chain</li>
              <li>2. Settlement is blocked for 24-hour dispute window</li>
              <li>3. Admin reviews the dispute and collects evidence</li>
              <li>4. Manual decision made (confirm charges or refund)</li>
              <li>5. Off-chain resolution executed</li>
            </ol>
          </div>

          <div className="rounded-lg border border-border-subtle bg-bg-secondary/30 p-12 text-center">
            <p className="text-text-secondary">
              Disputes will appear here as they are raised by buyers or providers
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
