interface LatencyEntry {
  checkRunId: string;
  startedAt: string;
  avgLatencyMs: number | null;
}

const HUE = "#38bdf8"; // sky-400 — single series, magnitude
const CHART_HEIGHT = 80;
const BAR_GAP = 2;

export function LatencyChart({ history }: { history: LatencyEntry[] }) {
  const chronological = [...history].reverse().filter((entry) => entry.avgLatencyMs !== null);

  if (chronological.length === 0) {
    return <p className="text-sm text-slate-500">No latency data yet.</p>;
  }

  const maxLatency = Math.max(...chronological.map((entry) => entry.avgLatencyMs ?? 0), 1);
  const barWidth = 8;
  const width = chronological.length * (barWidth + BAR_GAP) - BAR_GAP;
  const last = chronological[chronological.length - 1] as LatencyEntry;

  return (
    <div>
      <div className="flex items-baseline justify-between">
        <p className="text-xs text-slate-500">Average latency per check</p>
        <p className="tabular-nums text-xs text-slate-400">
          latest: {last.avgLatencyMs}ms
        </p>
      </div>
      <svg
        viewBox={`0 0 ${Math.max(width, barWidth)} ${CHART_HEIGHT}`}
        width="100%"
        height={CHART_HEIGHT}
        preserveAspectRatio="none"
        role="img"
        aria-label="Latency history"
        className="mt-2"
      >
        <line
          x1={0}
          y1={CHART_HEIGHT - 1}
          x2={width}
          y2={CHART_HEIGHT - 1}
          stroke="#1e293b"
          strokeWidth={1}
        />
        {chronological.map((entry, index) => {
          const latency = entry.avgLatencyMs ?? 0;
          const barHeight = Math.max((latency / maxLatency) * (CHART_HEIGHT - 4), 2);
          return (
            <rect
              key={entry.checkRunId}
              x={index * (barWidth + BAR_GAP)}
              y={CHART_HEIGHT - 1 - barHeight}
              width={barWidth}
              height={barHeight}
              rx={2}
              fill={HUE}
            >
              <title>
                {new Date(entry.startedAt).toLocaleString()} — {latency}ms
              </title>
            </rect>
          );
        })}
      </svg>
    </div>
  );
}
