import { Card } from "@/components/Card";

export default function AdminAnchorsPage() {
  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold">Anchor Management</h1>
          <p className="mt-2 text-text-secondary">View and manage all anchors</p>
        </div>
      </div>

      <Card>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border-subtle">
              <th className="px-4 py-3 text-left font-semibold text-text-primary">Domain</th>
              <th className="px-4 py-3 text-left font-semibold text-text-primary">Network</th>
              <th className="px-4 py-3 text-left font-semibold text-text-primary">Status</th>
              <th className="px-4 py-3 text-left font-semibold text-text-primary">Claim Status</th>
              <th className="px-4 py-3 text-left font-semibold text-text-primary">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-border-subtle">
              <td colSpan={5} className="px-4 py-8 text-center text-text-secondary">
                Coming in Prompt No. 2 — anchor list with hide/unhide/force-check controls
              </td>
            </tr>
          </tbody>
        </table>
      </Card>
    </div>
  );
}
