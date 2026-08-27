import { Card } from "@/components/Card";

export default function AdminUsersPage() {
  return (
    <div>
      <h1 className="font-display text-3xl font-bold">User Management</h1>
      <p className="mt-2 text-text-secondary">Manage operators and admins</p>

      <Card className="mt-8">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border-subtle">
              <th className="px-4 py-3 text-left font-semibold">Email</th>
              <th className="px-4 py-3 text-left font-semibold">Role</th>
              <th className="px-4 py-3 text-left font-semibold">Created</th>
              <th className="px-4 py-3 text-left font-semibold">Last Login</th>
              <th className="px-4 py-3 text-left font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-border-subtle">
              <td colSpan={5} className="px-4 py-8 text-center text-text-secondary">
                Coming in Prompt No. 2 — user list with suspend/unsuspend
              </td>
            </tr>
          </tbody>
        </table>
      </Card>
    </div>
  );
}
