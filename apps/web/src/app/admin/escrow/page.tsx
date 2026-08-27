import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Escrow Accounts — SEPGATE Admin",
};

export default async function AdminEscrowPage() {
  return (
    <main className="min-h-screen bg-bg-primary text-text-primary">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="mb-8">
          <Link href="/admin" className="text-sm text-text-secondary hover:text-text-primary">
            ← Back to admin
          </Link>
          <h1 className="mt-4 text-3xl font-bold">Escrow Accounts</h1>
          <p className="mt-2 text-text-secondary">
            View all on-chain escrow accounts, drill into usage receipts, and verify
            live contract state
          </p>
        </div>

        <div className="space-y-6">
          <div className="grid gap-6 sm:grid-cols-3">
            <div className="rounded-lg border border-border-subtle bg-bg-secondary/30 p-6">
              <p className="text-xs text-text-tertiary">Active Escrows</p>
              <p className="mt-2 text-3xl font-bold text-accent-primary">0</p>
            </div>
            <div className="rounded-lg border border-border-subtle bg-bg-secondary/30 p-6">
              <p className="text-xs text-text-tertiary">Total Locked</p>
              <p className="mt-2 text-3xl font-bold text-accent-primary">$0 USDC</p>
            </div>
            <div className="rounded-lg border border-border-subtle bg-bg-secondary/30 p-6">
              <p className="text-xs text-text-tertiary">Settled This Week</p>
              <p className="mt-2 text-3xl font-bold text-accent-primary">$0 USDC</p>
            </div>
          </div>

          <div className="rounded-lg border border-border-subtle bg-bg-secondary/30 p-12 text-center">
            <p className="text-text-secondary">
              Escrow accounts will appear here as providers deposit funds on-chain
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
