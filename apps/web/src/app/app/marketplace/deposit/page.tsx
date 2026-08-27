import type { Metadata } from "next";
import Link from "next/link";
import { getSession } from "@/lib/session";
import { Button } from "@/components/Button";

export const metadata: Metadata = {
  title: "Deposit into Escrow — SEPGATE",
};

export default async function DepositPage(
  props: { searchParams: Promise<{ provider?: string }> }
) {
  const searchParams = await props.searchParams;
  const providerId = searchParams.provider;
  const session = await getSession();

  if (!session.userId) {
    return null;
  }

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary">
      <div className="mx-auto max-w-2xl px-6 py-12">
        <Link href="/marketplace" className="text-sm text-text-secondary hover:text-text-primary">
          ← Back to marketplace
        </Link>

        <h1 className="mt-6 text-3xl font-bold">Deposit into Escrow</h1>
        <p className="mt-2 text-text-secondary">
          Fund an escrow account to purchase API calls from a provider
        </p>

        <div className="mt-10 space-y-6 rounded-lg border border-border-subtle bg-bg-secondary/30 p-6">
          <form className="space-y-4">
            <div>
              <label htmlFor="provider" className="block text-sm text-text-secondary">
                Provider
              </label>
              <input
                id="provider"
                name="provider"
                type="text"
                disabled
                value={providerId || "Select from marketplace"}
                className="mt-1 w-full rounded-md border border-border-subtle bg-bg-primary px-3 py-2 text-sm text-text-tertiary"
              />
            </div>

            <div>
              <label htmlFor="amount" className="block text-sm text-text-secondary">
                Deposit Amount (USDC)
              </label>
              <input
                id="amount"
                name="amount"
                type="number"
                step="0.01"
                min="1"
                required
                placeholder="100.00"
                className="mt-1 w-full rounded-md border border-border-subtle bg-bg-secondary px-3 py-2 text-sm text-text-primary focus:border-accent-primary focus:outline-none"
              />
              <p className="mt-1 text-xs text-text-tertiary">
                Minimum deposit: $1.00 USDC
              </p>
            </div>

            <div className="rounded-md bg-bg-primary p-4">
              <p className="text-sm text-text-secondary">
                <strong>How it works:</strong>
              </p>
              <ul className="mt-2 space-y-1 text-sm text-text-tertiary">
                <li>• 1. Connect your Stellar wallet</li>
                <li>• 2. Approve USDC transfer to escrow contract</li>
                <li>• 3. Escrow account created with your deposit</li>
                <li>• 4. Provider can now serve you API calls</li>
                <li>• 5. Each call is metered and deducted from your balance</li>
              </ul>
            </div>

            <Button variant="primary" className="w-full">
              Connect Wallet & Deposit
            </Button>
          </form>

          <div className="border-t border-border-subtle pt-6">
            <p className="text-sm text-text-secondary">
              <strong>Dispute window:</strong> 24 hours after settlement is initiated
            </p>
            <p className="mt-2 text-sm text-text-secondary">
              If there's a disagreement about charges, either party can raise a dispute
              within 24 hours to block settlement and resolve manually.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
