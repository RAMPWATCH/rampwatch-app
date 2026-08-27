import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/Button";

export const metadata: Metadata = {
  title: "Providers — SEPGATE Admin",
};

export default async function AdminProvidersPage() {
  return (
    <main className="min-h-screen bg-bg-primary text-text-primary">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="mb-8">
          <Link href="/admin" className="text-sm text-text-secondary hover:text-text-primary">
            ← Back to admin
          </Link>
          <h1 className="mt-4 text-3xl font-bold">Providers</h1>
          <p className="mt-2 text-text-secondary">
            Approve, suspend, and manage verification tiers for marketplace providers
          </p>
        </div>

        <div className="rounded-lg border border-border-subtle bg-bg-secondary/30 p-12 text-center">
          <p className="text-text-secondary">
            Provider management tools will appear here as providers register via SEP-10
          </p>
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-3">
          <div className="rounded-lg border border-border-subtle bg-bg-secondary/30 p-6">
            <p className="text-xs text-text-tertiary">Total Providers</p>
            <p className="mt-2 text-3xl font-bold text-accent-primary">0</p>
          </div>
          <div className="rounded-lg border border-border-subtle bg-bg-secondary/30 p-6">
            <p className="text-xs text-text-tertiary">Active Listings</p>
            <p className="mt-2 text-3xl font-bold text-accent-primary">0</p>
          </div>
          <div className="rounded-lg border border-border-subtle bg-bg-secondary/30 p-6">
            <p className="text-xs text-text-tertiary">TVL (Total Value Locked)</p>
            <p className="mt-2 text-3xl font-bold text-accent-primary">$0</p>
          </div>
        </div>
      </div>
    </main>
  );
}
