import { Card } from "@/components/Card";

interface StatCard {
  label: string;
  value: string | number;
  trend?: string;
}

export default async function AdminDashboard() {
  // Stats would be fetched from API endpoints in full implementation
  // For now, showing placeholder structure
  const stats: StatCard[] = [
    { label: "Total Anchors", value: "—" },
    { label: "Total Users", value: "—" },
    { label: "Checks Performed", value: "—" },
    { label: "Transactions (Settled)", value: "—" },
  ];

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
