import { Card } from "@/components/Card";

export default function AdminAuditLogPage() {
  return (
    <div>
      <h1 className="font-display text-3xl font-bold">Audit Log</h1>
      <p className="mt-2 text-text-secondary">Track all admin actions</p>

      <Card className="mt-8">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border-subtle">
              <th className="px-4 py-3 text-left font-semibold">Admin</th>
              <th className="px-4 py-3 text-left font-semibold">Action</th>
              <th className="px-4 py-3 text-left font-semibold">Target</th>
              <th className="px-4 py-3 text-left font-semibold">Timestamp</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-border-subtle">
              <td colSpan={4} className="px-4 py-8 text-center text-text-secondary">
                Coming in Prompt No. 2 — paginated audit log with filtering
              </td>
            </tr>
          </tbody>
        </table>
      </Card>
    </div>
  );
}
