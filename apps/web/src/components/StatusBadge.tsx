import type { CheckStatus } from "@/lib/api";

const STYLES: Record<CheckStatus, { label: string; dot: string; text: string }> = {
  operational: { label: "Operational", dot: "bg-status-operational", text: "text-emerald-300" },
  degraded: { label: "Degraded", dot: "bg-status-degraded", text: "text-amber-300" },
  down: { label: "Down", dot: "bg-status-down", text: "text-rose-300" },
};

export function StatusBadge({ status }: { status: CheckStatus | null }) {
  if (!status) {
    return (
      <span className="inline-flex items-center gap-1.5 text-sm text-text-secondary">
        <span className="h-2 w-2 rounded-full bg-slate-600" />
        No data yet
      </span>
    );
  }

  const style = STYLES[status];
  return (
    <span className={`inline-flex items-center gap-1.5 text-sm font-medium ${style.text}`}>
      <span className={`h-2 w-2 rounded-full ${style.dot}`} />
      {style.label}
    </span>
  );
}
