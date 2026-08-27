import Link from "next/link";
import { Card } from "@/components/Card";

const sections = [
  {
    title: "SEP Specifications",
    items: [
      { name: "SEP-1", desc: "Stellar TOML (federation, endpoints)" },
      { name: "SEP-6", desc: "Deposit/Withdrawal API" },
      { name: "SEP-10", desc: "Stellar Web Authentication" },
      { name: "SEP-24", desc: "Interactive Customer Transfer" },
      { name: "SEP-38", desc: "Anchor Quote Server" },
    ],
  },
  {
    title: "API Reference",
    items: [
      { name: "Public Anchors", desc: "GET /api/v1/anchors — List all anchors" },
      { name: "Anchor Detail", desc: "GET /api/v1/anchors/:slug — Get status & history" },
      { name: "Check Receipt", desc: "GET /api/v1/checks/:checkRunId — Public verification" },
    ],
  },
  {
    title: "Payment Flow (x402)",
    items: [
      { name: "Paid Checks", desc: "POST /api/v1/x402/anchors/:slug/check — On-demand check" },
      { name: "Full Report", desc: "POST /api/v1/x402/full-report — All 5 SEPs for any domain" },
      { name: "Verification", desc: "POST /api/v1/x402/verify-domain — Domain ownership verification" },
    ],
  },
];

export const metadata = {
  title: "API Documentation",
};

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-bg-primary text-text-primary">
      <div className="mx-auto max-w-4xl px-6 py-12">
        <div>
          <h1 className="font-display text-4xl font-bold">SEPGATE API Docs</h1>
          <p className="mt-4 max-w-2xl text-lg text-text-secondary">
            Stellar anchor compliance monitoring via SEP-1/6/10/24/38 checks. Free on a schedule,
            or on-demand via x402 micropayments.
          </p>
        </div>

        <div className="mt-12 space-y-12">
          {sections.map((section) => (
            <div key={section.title}>
              <h2 className="font-display text-2xl font-bold">{section.title}</h2>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                {section.items.map((item) => (
                  <Card key={item.name}>
                    <h3 className="font-semibold text-text-primary">{item.name}</h3>
                    <p className="mt-2 text-sm text-text-secondary">{item.desc}</p>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>

        <Card className="mt-12">
          <h2 className="font-display text-xl font-bold">Webhook Payload (Alerts)</h2>
          <div className="mt-4 overflow-x-auto">
            <pre className="rounded-md bg-bg-secondary p-4 text-sm text-text-primary">
{`{
  "event": "check_completed",
  "anchor": {
    "slug": "example-com",
    "domain": "example.com",
    "network": "mainnet"
  },
  "checkRun": {
    "id": "uuid",
    "status": "operational|degraded|down",
    "completedAt": "2024-08-27T12:34:56Z",
    "results": [
      {
        "sepType": "sep1",
        "passed": true,
        "latencyMs": 245
      }
    ]
  }
}`}
            </pre>
          </div>
        </Card>

        <Card className="mt-8 bg-bg-secondary">
          <h2 className="font-display text-lg font-bold text-accent-primary">Quick Start</h2>
          <ul className="mt-4 space-y-2 text-sm text-text-secondary">
            <li>
              1. <Link href="/directory" className="text-accent-primary hover:underline">
                Browse anchors
              </Link>
              {" "}to see live SEP check results
            </li>
            <li>
              2. <Link href="/login" className="text-accent-primary hover:underline">
                Sign up
              </Link>
              {" "}to claim your anchor and set up alerts
            </li>
            <li>
              3. Use POST /x402/* endpoints to run on-demand checks via micropayment
            </li>
            <li>
              4. Admins access /admin for dashboard and system configuration
            </li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
