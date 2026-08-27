import { Card } from "@/components/Card";

export default function AdminAlertsPage() {
  return (
    <div>
      <h1 className="font-display text-3xl font-bold">Alert Configuration</h1>
      <p className="mt-2 text-text-secondary">View all configured alerts</p>

      <Card className="mt-8">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border-subtle">
              <th className="px-4 py-3 text-left font-semibold">Anchor</th>
              <th className="px-4 py-3 text-left font-semibold">Recipient</th>
              <th className="px-4 py-3 text-left font-semibold">Channel</th>
              <th className="px-4 py-3 text-left font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-border-subtle">
              <td colSpan={4} className="px-4 py-8 text-center text-text-secondary">
                Coming in Prompt No. 2 — system-wide alert overview
              </td>
            </tr>
          </tbody>
        </table>
      </Card>
    </div>
  );
}
