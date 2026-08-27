import type { Metadata } from "next";
import Link from "next/link";
import { getSession } from "@/lib/session";
import { Button } from "@/components/Button";

export const metadata: Metadata = {
  title: "My Listings — SEPGATE Provider",
};

export default async function ProviderListingsPage() {
  const session = await getSession();

  if (!session.userId) {
    return null;
  }

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary">
      <div className="mx-auto max-w-4xl px-6 py-12">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <Link href="/app" className="text-sm text-text-secondary hover:text-text-primary">
              ← Back to dashboard
            </Link>
            <h1 className="mt-4 text-3xl font-bold">My API Listings</h1>
            <p className="mt-2 text-text-secondary">
              Create and manage API listings on the SEPGATE marketplace
            </p>
          </div>
          <Link href="/app/provider/listings/new">
            <Button variant="primary">Create Listing</Button>
          </Link>
        </div>

        <div className="rounded-lg border border-border-subtle bg-bg-secondary/30 p-12 text-center">
          <p className="text-text-secondary">
            No listings yet. Start by creating your first API listing.
          </p>
          <Link href="/app/provider/listings/new">
            <Button variant="outline" className="mt-6">
              New Listing
            </Button>
          </Link>
        </div>

        <div className="mt-12 rounded-lg border border-border-subtle bg-bg-secondary/30 p-6">
          <h2 className="text-lg font-semibold text-text-primary">Escrow Accounts</h2>
          <p className="mt-2 text-sm text-text-secondary">
            Buyers who have deposited USDC to purchase access to your APIs
          </p>
          <div className="mt-6 text-sm text-text-tertiary">
            Create your first listing to see escrow accounts appear here.
          </div>
        </div>
      </div>
    </div>
  );
}
