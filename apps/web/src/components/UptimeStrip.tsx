import type { CheckStatus } from "@/lib/api";

const STATUS_FILL: Record<CheckStatus, string> = {
  operational: "#34d399", // status-operational
  degraded: "#fbbf24", // status-degraded
  down: "#fb7185", // status-down
};

const STATUS_LABEL: Record<CheckStatus, string> = {
  operational: "Operational",
  degraded: "Degraded",
  down: "Down",
};

interface HistoryEntry {
  checkRunId: string;
  status: CheckStatus;
  startedAt: string;
}

const BAR_HEIGHT = 32;
const BAR_GAP = 2;

export function UptimeStrip({ history }: { history: HistoryEntry[] }) {
  // API returns newest-first; render oldest → newest, left → right.
  const chronological = [...history].reverse();
  const barWidth = 8;
  const width = chronological.length * (barWidth + BAR_GAP) - BAR_GAP;

  return (
    <div>
      <svg
        viewBox={`0 0 ${Math.max(width, barWidth)} ${BAR_HEIGHT}`}
        width="100%"
        height={BAR_HEIGHT}
        preserveAspectRatio="none"
        role="img"
        aria-label={`Check history: ${chronological.length} runs`}
      >
        {chronological.map((entry, index) => (
          <rect
            key={entry.checkRunId}
            x={index * (barWidth + BAR_GAP)}
            y={0}
            width={barWidth}
            height={BAR_HEIGHT}
            rx={4}
            fill={STATUS_FILL[entry.status]}
          >
            <title>
              {new Date(entry.startedAt).toLocaleString()} — {STATUS_LABEL[entry.status]}
            </title>
          </rect>
        ))}
      </svg>
      <div className="mt-3 flex items-center gap-4 text-xs text-text-secondary">
        {(Object.keys(STATUS_LABEL) as CheckStatus[]).map((status) => (
          <span key={status} className="flex items-center gap-1.5">
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: STATUS_FILL[status] }}
            />
            {STATUS_LABEL[status]}
          </span>
        ))}
      </div>
    </div>
  );
}
