import Link from "next/link";
import { getSession } from "@/lib/session";
import { operatorFetch } from "@/lib/operatorApi";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";

interface AnchorSummary {
  id: string;
  slug: string;
  domain: string;
  displayName: string | null;
  network: "mainnet" | "testnet";
  claimStatus: string;
  status: string | null;
  lastCheckedAt: Date | null;
}

export default async function OperatorDashboard() {
  const session = await getSession();

  if (!session.userId) {
    return null;
  }

  const result = await operatorFetch<{ anchors: AnchorSummary[] }>(
    "/operator/anchors",
    session
  );

  const anchors = result.ok ? result.data?.anchors ?? [] : [];

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold">
              Operator Dashboard
            </h1>
            <p className="mt-2 text-text-secondary">
              Manage your Stellar anchor SEP implementations
            </p>
          </div>
          <Link href="/app/anchors/claim">
            <Button variant="primary">Claim Anchor</Button>
          </Link>
        </div>

        {anchors.length === 0 ? (
          <Card>
            <div className="py-12 text-center">
              <p className="text-text-secondary">
                No anchors claimed yet.{" "}
                <Link
                  href="/app/anchors/claim"
                  className="text-accent-primary hover:underline"
                >
                  Claim your first anchor →
                </Link>
              </p>
            </div>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {anchors.map((anchor) => (
              <Link key={anchor.id} href={`/app/anchors/${anchor.slug}`}>
                <Card>
                  <div className="space-y-2">
                    <h3 className="font-display font-semibold">
                      {anchor.displayName || anchor.domain}
                    </h3>
                    <p className="text-sm text-text-secondary">{anchor.domain}</p>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-text-tertiary">{anchor.network}</span>
                      <span
                        className={`rounded px-2 py-1 ${
                          anchor.status === "operational"
                            ? "bg-status-operational text-bg-primary"
                            : anchor.status === "degraded"
                              ? "bg-status-degraded text-bg-primary"
                              : "bg-status-down text-bg-primary"
                        }`}
                      >
                        {anchor.status || "pending"}
                      </span>
                    </div>
                    {anchor.lastCheckedAt && (
                      <p className="text-xs text-text-tertiary">
                        Last checked:{" "}
                        {new Date(anchor.lastCheckedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
