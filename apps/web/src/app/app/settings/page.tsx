import type { Metadata } from "next";
import Link from "next/link";
import { getSession } from "@/lib/session";
import { operatorFetch } from "@/lib/operatorApi";
import { Button } from "@/components/Button";

export const metadata: Metadata = {
  title: "Account Settings — SEPGATE",
};

export default async function SettingsPage() {
  const session = await getSession();

  if (!session.userId) {
    return null;
  }

  const response = await operatorFetch("/operator/me", session);
  const user = response.ok ? response.data : null;

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary">
      <div className="mx-auto max-w-2xl px-6 py-12">
        <div className="mb-8">
          <Link href="/app" className="text-sm text-text-secondary hover:text-text-primary">
            ← Back to dashboard
          </Link>
          <h1 className="mt-4 text-3xl font-bold">Account Settings</h1>
        </div>

        <div className="space-y-8">
          {/* Account Info */}
          <div className="rounded-lg border border-border-subtle bg-bg-secondary/30 p-6">
            <h2 className="text-lg font-semibold text-text-primary">Email</h2>
            <p className="mt-1 text-sm text-text-secondary">Your account email address</p>
            <div className="mt-4 rounded-md border border-border-subtle bg-bg-primary px-3 py-2.5">
              <p className="text-sm text-text-primary">{user?.email}</p>
            </div>
            <p className="mt-2 text-xs text-text-tertiary">
              Account created {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—"}
            </p>
          </div>

          {/* Change Password */}
          <div className="rounded-lg border border-border-subtle bg-bg-secondary/30 p-6">
            <h2 className="text-lg font-semibold text-text-primary">Change Password</h2>
            <p className="mt-1 text-sm text-text-secondary">Update your login password</p>
            <form action="/app/settings/password" method="POST" className="mt-4 space-y-4">
              <div>
                <label htmlFor="currentPassword" className="block text-sm text-text-secondary">
                  Current password
                </label>
                <input
                  id="currentPassword"
                  name="currentPassword"
                  type="password"
                  required
                  className="mt-1 w-full rounded-md border border-border-subtle bg-bg-secondary px-3 py-2 text-sm text-text-primary focus:border-accent-primary focus:outline-none"
                />
              </div>
              <div>
                <label htmlFor="newPassword" className="block text-sm text-text-secondary">
                  New password
                </label>
                <input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  required
                  minLength={8}
                  className="mt-1 w-full rounded-md border border-border-subtle bg-bg-secondary px-3 py-2 text-sm text-text-primary focus:border-accent-primary focus:outline-none"
                />
                <p className="mt-1 text-xs text-text-tertiary">At least 8 characters</p>
              </div>
              <div>
                <label htmlFor="confirmPassword" className="block text-sm text-text-secondary">
                  Confirm new password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  minLength={8}
                  className="mt-1 w-full rounded-md border border-border-subtle bg-bg-secondary px-3 py-2 text-sm text-text-primary focus:border-accent-primary focus:outline-none"
                />
              </div>
              <Button variant="primary" className="w-full">
                Update password
              </Button>
            </form>
          </div>

          {/* Login History */}
          <div className="rounded-lg border border-border-subtle bg-bg-secondary/30 p-6">
            <h2 className="text-lg font-semibold text-text-primary">Login Activity</h2>
            <p className="mt-1 text-sm text-text-secondary">Last logged in</p>
            <p className="mt-4 text-sm text-text-primary">
              {user?.lastLoginAt
                ? new Date(user.lastLoginAt).toLocaleString()
                : "No previous login"}
            </p>
          </div>

          {/* Danger Zone */}
          <div className="rounded-lg border border-status-down/30 bg-status-down/[0.03] p-6">
            <h2 className="text-lg font-semibold text-status-down">Danger Zone</h2>
            <p className="mt-2 text-sm text-text-secondary">
              Log out of this account on all devices. You'll be redirected to login.
            </p>
            <form action="/login" method="POST" className="mt-4">
              <input type="hidden" name="logout" value="true" />
              <button
                type="submit"
                className="rounded-md border border-status-down/50 px-4 py-2.5 text-sm font-medium text-status-down transition hover:bg-status-down/10"
              >
                Sign out everywhere
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
