import type { SepResult } from "@/lib/api";

const SEP_LABELS: Record<string, string> = {
  sep1: "SEP-1 · stellar.toml",
  sep6: "SEP-6 · Deposit & Withdrawal",
  sep10: "SEP-10 · Web Authentication",
  sep24: "SEP-24 · Interactive Deposit & Withdrawal",
  sep38: "SEP-38 · Quote Server",
};

export function SepCheckRow({ result }: { result: SepResult }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border-subtle py-3 last:border-b-0">
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-slate-200">
          {SEP_LABELS[result.sepType] ?? result.sepType}
        </p>
        {result.errorDetail && (
          <p className="mt-0.5 truncate text-xs text-status-down">{result.errorDetail}</p>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-3 text-sm">
        {result.latencyMs !== null && (
          <span className="tabular-nums text-text-secondary">{result.latencyMs}ms</span>
        )}
        <span
          className={
            result.passed
              ? "rounded-full bg-status-operational/10 px-2 py-0.5 text-xs font-medium text-emerald-300"
              : "rounded-full bg-status-down/10 px-2 py-0.5 text-xs font-medium text-rose-300"
          }
        >
          {result.passed ? "Pass" : "Fail"}
        </span>
      </div>
    </div>
  );
}
