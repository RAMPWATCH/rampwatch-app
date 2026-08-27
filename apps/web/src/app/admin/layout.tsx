import { ReactNode } from "react";
import Link from "next/link";
import { requireAdminSession } from "@/lib/session";

const ADMIN_LINKS = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/anchors", label: "Anchors" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/transactions", label: "Transactions" },
  { href: "/admin/pricing", label: "Pricing" },
  { href: "/admin/alerts", label: "Alerts" },
  { href: "/admin/audit-log", label: "Audit Log" },
];

export const metadata = {
  title: "Admin Console",
};

export default async function AdminLayout({ children }: { children: ReactNode }) {
  await requireAdminSession();

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary">
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 border-r border-border-subtle bg-bg-secondary">
          <div className="p-6">
            <Link href="/admin" className="text-lg font-bold text-accent-primary">
              SEPGATE Admin
            </Link>
          </div>
          <nav className="space-y-1 px-3 py-6">
            {ADMIN_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block rounded-md px-4 py-2 text-sm transition hover:bg-bg-primary"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-auto">
          <div className="p-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
