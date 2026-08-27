import type { Metadata } from "next";
import Link from "next/link";
import { publicFetch } from "@/lib/api";
import { StatusBadge } from "@/components/StatusBadge";

export const metadata: Metadata = {
  title: "Marketplace — SEPGATE",
};

interface ProviderListing {
  id: string;
  providerId: string;
  providerName: string;
  verificationTier: string;
  endpointUrl: string;
  pricePerCall: string;
  description: string;
  category: string;
  isActive: boolean;
}

export default async function MarketplacePage() {
  // Fetch active provider listings from public API
  const response = await publicFetch<{ listings: ProviderListing[] }>(
    "/api/v1/marketplace/listings"
  );

  const listings = response.ok ? response.data?.listings ?? [] : [];

  const getTierBadge = (tier: string) => {
    switch (tier) {
      case "sep10":
        return "SEP-10 Verified";
      case "admin":
        return "Admin Approved";
      default:
        return "Unverified";
    }
  };

  return (
    <main className="min-h-screen bg-bg-primary text-text-primary">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="mb-12">
          <p className="text-sm font-medium text-status-operational">Marketplace</p>
          <h1 className="mt-3 text-4xl font-bold">Decentralized API Marketplace</h1>
          <p className="mt-4 max-w-2xl text-lg text-text-secondary">
            Discover and connect to community-built APIs secured by on-chain escrow.
            Pay per use, no subscriptions.
          </p>
        </div>

        {listings.length === 0 ? (
          <div className="rounded-lg border border-border-subtle bg-bg-secondary/30 p-12 text-center">
            <p className="text-text-secondary">
              No listings available yet. Be the first provider to list an API!
            </p>
            <Link
              href="/app/provider/listings"
              className="mt-6 inline-block rounded-md bg-accent-primary px-6 py-2.5 text-sm font-semibold text-bg-primary hover:bg-white"
            >
              Become a Provider
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {listings.map((listing) => (
              <div
                key={listing.id}
                className="flex flex-col rounded-lg border border-border-subtle bg-bg-secondary/30 p-6 transition hover:border-border-active hover:-translate-y-1"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-text-primary">{listing.providerName}</h3>
                    <p className="mt-1 text-sm text-text-secondary">{listing.category}</p>
                  </div>
                  <span className="shrink-0 rounded-full bg-accent-dim px-2 py-1 text-xs font-medium text-accent-primary">
                    {getTierBadge(listing.verificationTier)}
                  </span>
                </div>

                <p className="mt-4 min-h-10 text-sm text-text-secondary">{listing.description}</p>

                <div className="mt-6 space-y-3 border-t border-border-subtle pt-6">
                  <div>
                    <p className="text-xs text-text-tertiary">Price per call</p>
                    <p className="font-semibold text-text-primary">${listing.pricePerCall}</p>
                  </div>
                  <div>
                    <p className="text-xs text-text-tertiary">Endpoint</p>
                    <p className="font-mono text-xs text-text-primary">
                      {listing.endpointUrl.slice(0, 40)}...
                    </p>
                  </div>
                </div>

                <Link
                  href={`/app/marketplace/deposit?provider=${listing.providerId}`}
                  className="mt-6 rounded-md border border-border-subtle px-4 py-2.5 text-center text-sm font-medium text-text-primary transition hover:border-border-active hover:bg-bg-elevated"
                >
                  Connect
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
