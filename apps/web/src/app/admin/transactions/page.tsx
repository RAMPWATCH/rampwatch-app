import { Card } from "@/components/Card";

export default function AdminTransactionsPage() {
  return (
    <div>
      <h1 className="font-display text-3xl font-bold">x402 Transactions</h1>
      <p className="mt-2 text-text-secondary">View all paid check transactions</p>

      <Card className="mt-8">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border-subtle">
              <th className="px-4 py-3 text-left font-semibold">Payer</th>
              <th className="px-4 py-3 text-left font-semibold">Endpoint</th>
              <th className="px-4 py-3 text-left font-semibold">Amount</th>
              <th className="px-4 py-3 text-left font-semibold">Status</th>
              <th className="px-4 py-3 text-left font-semibold">Date</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-border-subtle">
              <td colSpan={5} className="px-4 py-8 text-center text-text-secondary">
                Coming in Prompt No. 2 — transaction list with filtering
              </td>
            </tr>
          </tbody>
        </table>
      </Card>
    </div>
  );
}
