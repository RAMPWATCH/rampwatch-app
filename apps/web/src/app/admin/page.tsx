import { getDb } from "@/../../apps/api/src/db/client";
import { anchors, users, x402Transactions, checkRuns } from "@/../../apps/api/src/db/schema";
import { count, eq, sql } from "drizzle-orm";
import { Card } from "@/components/Card";

interface StatCard {
  label: string;
  value: string | number;
  trend?: string;
}

export default async function AdminDashboard() {
  let stats: StatCard[] = [];

  try {
    const db = await getDb();

    // Get stats in parallel
    const [anchorStats, userStats, transactionStats, checkStats] = await Promise.all([
      db.select({ total: count() }).from(anchors),
      db.select({ total: count() }).from(users),
      db.select({ total: count(), settled: count(eq(x402Transactions.status, "settled")) }).from(x402Transactions),
      db.select({ total: count() }).from(checkRuns),
    ]);

    const totalAnchors = anchorStats[0]?.total || 0;
    const totalUsers = userStats[0]?.total || 0;
    const totalTransactions = transactionStats[0]?.total || 0;
    const settledTransactions = transactionStats[0]?.settled || 0;
    const totalChecks = checkStats[0]?.total || 0;

    stats = [
      { label: "Total Anchors", value: totalAnchors },
      { label: "Total Users", value: totalUsers },
      { label: "Checks Performed", value: totalChecks },
      { label: "Transactions (Settled)", value: `${settledTransactions}/${totalTransactions}` },
    ];
  } catch (error) {
    console.error("[Admin Dashboard]", error);
  }

  return (
    <div>
      <h1 className="font-display text-3xl font-bold">Admin Dashboard</h1>
      <p className="mt-2 text-text-secondary">System overview and key metrics</p>

      <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <div className="space-y-2">
              <p className="text-sm text-text-secondary">{stat.label}</p>
              <p className="font-display text-2xl font-bold text-accent-primary">
                {stat.value}
              </p>
              {stat.trend && <p className="text-xs text-text-tertiary">{stat.trend}</p>}
            </div>
          </Card>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card>
          <h3 className="font-display font-semibold">Recent Activity</h3>
          <p className="mt-2 text-sm text-text-secondary">
            Coming in Prompt No. 2 — check run activity log
          </p>
        </Card>
        <Card>
          <h3 className="font-display font-semibold">System Health</h3>
          <p className="mt-2 text-sm text-text-secondary">
            All services operational ✓
          </p>
        </Card>
      </div>
    </div>
  );
}
