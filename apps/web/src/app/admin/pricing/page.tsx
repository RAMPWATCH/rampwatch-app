import { Card } from "@/components/Card";
import { Button } from "@/components/Button";

export default function AdminPricingPage() {
  return (
    <div>
      <h1 className="font-display text-3xl font-bold">Platform Pricing</h1>
      <p className="mt-2 text-text-secondary">Configure pricing and payment settings</p>

      <div className="mt-8 grid gap-6 md:grid-cols-3">
        {[
          { label: "Price per Check", key: "priceCheck", default: "$0.02" },
          { label: "Price per Full Report", key: "priceFullReport", default: "$0.10" },
          { label: "Price per Domain Verification", key: "priceVerifyDomain", default: "$0.05" },
        ].map((item) => (
          <Card key={item.key}>
            <div className="space-y-3">
              <label className="block text-sm font-medium text-text-primary">
                {item.label}
              </label>
              <input
                type="text"
                defaultValue={item.default}
                className="w-full rounded-md border border-border-subtle bg-bg-secondary px-3 py-2 text-text-primary"
                disabled
              />
            </div>
          </Card>
        ))}
      </div>

      <Card className="mt-8">
        <h3 className="font-display font-semibold">Stellar Network</h3>
        <p className="mt-2 text-sm text-text-secondary">
          Coming in Prompt No. 2 — network toggle with confirmation
        </p>
      </Card>

      <div className="mt-8 flex gap-3">
        <Button variant="primary" disabled>
          Save Settings
        </Button>
      </div>
    </div>
  );
}
