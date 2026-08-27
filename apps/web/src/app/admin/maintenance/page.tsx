import type { Metadata } from "next";
import Link from "next/link";
import { adminFetch } from "@/lib/adminApi";
import { getSession } from "@/lib/session";
import { Button } from "@/components/Button";

export const metadata: Metadata = {
  title: "Maintenance — SEPGATE Admin",
};

export default async function MaintenancePage() {
  const session = await getSession();

  if (!session.userId) {
    return null;
  }

  const settingsResponse = await adminFetch("/api/v1/admin/settings", session);
  const settings = settingsResponse.ok ? settingsResponse.data : null;

  return (
    <main className="min-h-screen bg-bg-primary text-text-primary">
      <div className="mx-auto max-w-4xl px-6 py-12">
        <div className="mb-8">
          <Link href="/admin" className="text-sm text-text-secondary hover:text-text-primary">
            ← Back to admin
          </Link>
          <h1 className="mt-4 text-3xl font-bold">Maintenance & Operations</h1>
          <p className="mt-2 text-text-secondary">
            System controls for platform maintenance and manual operations.
          </p>
        </div>

        <div className="space-y-8">
          {/* Maintenance Mode */}
          <section className="rounded-lg border border-border-subtle bg-bg-secondary/30 p-6">
            <h2 className="text-lg font-semibold text-text-primary">Maintenance Mode</h2>
            <p className="mt-2 text-sm text-text-secondary">
              When enabled, the platform will return a 503 Service Unavailable response. Scheduled
              checks will not run.
            </p>
            <form action="/admin/maintenance/toggle" method="POST" className="mt-4">
              <input type="hidden" name="maintenance" value={!settings?.maintenanceMode ? "true" : "false"} />
              <Button
                variant={settings?.maintenanceMode ? "outline" : "primary"}
                className="w-full"
              >
                {settings?.maintenanceMode ? "Disable Maintenance Mode" : "Enable Maintenance Mode"}
              </Button>
            </form>
            <p className={`mt-3 text-sm ${settings?.maintenanceMode ? "text-status-degraded" : "text-text-tertiary"}`}>
              Status: {settings?.maintenanceMode ? "MAINTENANCE MODE ACTIVE" : "Normal operations"}
            </p>
          </section>

          {/* Scheduler Control */}
          <section className="rounded-lg border border-border-subtle bg-bg-secondary/30 p-6">
            <h2 className="text-lg font-semibold text-text-primary">Check Scheduler</h2>
            <p className="mt-2 text-sm text-text-secondary">
              Manually trigger a complete re-run of anchor compliance checks. This does not affect
              the automatic scheduler interval.
            </p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="rounded-md border border-border-subtle bg-bg-primary p-4">
                <p className="text-xs text-text-tertiary">Scheduler interval</p>
                <p className="mt-2 text-lg font-semibold text-text-primary">
                  {settings?.schedulerIntervalMinutes} minutes
                </p>
              </div>
              <div className="rounded-md border border-border-subtle bg-bg-primary p-4">
                <p className="text-xs text-text-tertiary">Network</p>
                <p className="mt-2 text-lg font-semibold text-text-primary">
                  {settings?.x402Network || "—"}
                </p>
              </div>
            </div>
            <form action="/admin/maintenance/run-scheduler" method="POST" className="mt-4">
              <Button variant="primary" className="w-full">
                Manually Run All Checks Now
              </Button>
            </form>
            <p className="mt-2 text-xs text-text-tertiary">
              This will queue check jobs for every anchor in the directory. Check /admin/audit-log
              for completion status.
            </p>
          </section>

          {/* Platform Settings Quick View */}
          <section className="rounded-lg border border-border-subtle bg-bg-secondary/30 p-6">
            <h2 className="text-lg font-semibold text-text-primary">x402 Configuration</h2>
            <p className="mt-2 text-sm text-text-secondary">
              Live pricing and payment settings. Edit in /admin/pricing.
            </p>
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between rounded-md border border-border-subtle bg-bg-primary px-4 py-2">
                <span className="text-sm text-text-secondary">Per-check price</span>
                <span className="font-semibold text-text-primary">
                  ${settings?.priceCheck} USDC
                </span>
              </div>
              <div className="flex items-center justify-between rounded-md border border-border-subtle bg-bg-primary px-4 py-2">
                <span className="text-sm text-text-secondary">Full report price</span>
                <span className="font-semibold text-text-primary">
                  ${settings?.priceFullReport} USDC
                </span>
              </div>
              <div className="flex items-center justify-between rounded-md border border-border-subtle bg-bg-primary px-4 py-2">
                <span className="text-sm text-text-secondary">Domain verification price</span>
                <span className="font-semibold text-text-primary">
                  ${settings?.priceVerifyDomain} USDC
                </span>
              </div>
              <div className="flex items-center justify-between rounded-md border border-border-subtle bg-bg-primary px-4 py-2">
                <span className="text-sm text-text-secondary">Payto address</span>
                <span className="font-mono text-xs text-text-primary">
                  {settings?.paytoAddress?.slice(0, 16)}...
                </span>
              </div>
            </div>
            <Link href="/admin/pricing">
              <Button variant="outline" className="mt-4 w-full">
                Edit Pricing & Settings
              </Button>
            </Link>
          </section>

          {/* Job Queue Info */}
          <section className="rounded-lg border border-border-subtle bg-bg-secondary/30 p-6">
            <h2 className="text-lg font-semibold text-text-primary">Job Queue & Logs</h2>
            <p className="mt-2 text-sm text-text-secondary">
              Monitor all system actions and background jobs.
            </p>
            <div className="mt-4 space-y-2">
              <Link href="/admin/audit-log">
                <Button variant="outline" className="w-full">
                  View Audit Log
                </Button>
              </Link>
              <Link href="/admin/transactions">
                <Button variant="outline" className="w-full">
                  View All Transactions
                </Button>
              </Link>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
