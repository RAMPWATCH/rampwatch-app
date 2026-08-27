import type { Metadata } from "next";
import Link from "next/link";
import { getSession } from "@/lib/session";
import { operatorFetch } from "@/lib/operatorApi";
import { Button } from "@/components/Button";

export const metadata: Metadata = {
  title: "Configure Alerts — SEPGATE",
};

interface Alert {
  id: string;
  channel: "email" | "webhook";
  destination: string;
  isActive: boolean;
}

async function deleteAlert(slug: string, alertId: string, session: any) {
  "use server";
  try {
    const response = await operatorFetch(
      `/operator/anchors/${slug}/alerts/${alertId}`,
      session,
      { method: "DELETE" }
    );
    return { success: response.ok };
  } catch {
    return { success: false };
  }
}

export default async function AlertsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const session = await getSession();

  if (!session.userId) {
    return null;
  }

  const response = await operatorFetch(`/operator/anchors/${slug}/alerts`, session);
  const alerts: Alert[] = response.ok ? response.data?.alerts ?? [] : [];

  const anchorResponse = await operatorFetch(`/operator/anchors/${slug}`, session);
  const anchor = anchorResponse.ok ? anchorResponse.data : null;

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary">
      <div className="mx-auto max-w-2xl px-6 py-12">
        <div className="mb-8">
          <Link href="/app" className="text-sm text-text-secondary hover:text-text-primary">
            ← Back to dashboard
          </Link>
          <h1 className="mt-4 text-3xl font-bold">
            Alerts for {anchor?.displayName || anchor?.domain || slug}
          </h1>
          <p className="mt-2 text-text-secondary">
            Configure email and webhook alerts to stay notified when your anchor's compliance
            status changes.
          </p>
        </div>

        <div className="space-y-6">
          {/* Add Alert Form */}
          <div className="rounded-lg border border-border-subtle bg-bg-secondary/30 p-6">
            <h2 className="text-lg font-semibold text-text-primary">Add a new alert</h2>
            <form action={`/app/anchors/${slug}/alerts/new`} method="POST" className="mt-4 space-y-4">
              <div>
                <label htmlFor="channel" className="block text-sm text-text-secondary">
                  Alert type
                </label>
                <select
                  id="channel"
                  name="channel"
                  required
                  className="mt-1 w-full rounded-md border border-border-subtle bg-bg-secondary px-3 py-2 text-sm text-text-primary focus:border-accent-primary focus:outline-none"
                >
                  <option value="">Select type...</option>
                  <option value="email">Email</option>
                  <option value="webhook">Webhook</option>
                </select>
              </div>
              <div>
                <label htmlFor="destination" className="block text-sm text-text-secondary">
                  {/* Placeholder changes based on channel selection */}
                  Email or Webhook URL
                </label>
                <input
                  id="destination"
                  name="destination"
                  type="text"
                  required
                  placeholder="email@example.com or https://..."
                  className="mt-1 w-full rounded-md border border-border-subtle bg-bg-secondary px-3 py-2 text-sm text-text-primary focus:border-accent-primary focus:outline-none"
                />
              </div>
              <Button variant="primary" className="w-full">
                Create alert
              </Button>
            </form>
          </div>

          {/* Alerts List */}
          <div>
            <h2 className="mb-4 text-lg font-semibold text-text-primary">
              Current alerts ({alerts.length})
            </h2>
            {alerts.length === 0 ? (
              <p className="rounded-lg border border-border-subtle bg-bg-secondary/30 p-6 text-center text-sm text-text-secondary">
                No alerts configured yet. Add one above.
              </p>
            ) : (
              <div className="space-y-3">
                {alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="flex items-center justify-between rounded-lg border border-border-subtle bg-bg-secondary/30 p-4"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="inline-block rounded px-2 py-1 text-xs font-medium text-text-primary bg-accent-dim">
                          {alert.channel}
                        </span>
                        <span
                          className={`text-xs font-medium ${
                            alert.isActive ? "text-status-operational" : "text-text-tertiary"
                          }`}
                        >
                          {alert.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>
                      <p className="mt-2 break-all text-sm text-text-secondary">{alert.destination}</p>
                    </div>
                    <div className="ml-4 flex gap-2">
                      <form action={`/app/anchors/${slug}/alerts/${alert.id}`} method="POST">
                        <input type="hidden" name="_method" value="DELETE" />
                        <button
                          type="submit"
                          className="rounded-md border border-border-subtle px-3 py-1.5 text-sm text-text-secondary transition hover:border-status-down hover:text-status-down"
                        >
                          Delete
                        </button>
                      </form>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
