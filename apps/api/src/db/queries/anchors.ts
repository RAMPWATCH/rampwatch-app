import { and, desc, eq, inArray, sql } from "drizzle-orm";
import type { Database } from "../client";
import { anchors, checkRuns, sepCheckResults, type Anchor, type CheckRun } from "../schema";

export interface AnchorWithStatus extends Anchor {
  latestStatus: CheckRun["status"] | null;
  lastCheckedAt: CheckRun["startedAt"] | null;
  assets: string[];
}

interface AssetBearingRawResponse {
  depositAssets?: unknown;
  withdrawAssets?: unknown;
  assets?: unknown;
}

// SEP-38's asset identifiers are SEP-38 CAAP form ("stellar:USDC:G...",
// "stellar:native", "iso4217:USD") rather than the bare codes SEP-6/24 use
// ("USDC", "native", "USD") — normalize to the bare code so the directory
// filter doesn't show the same asset twice under two spellings.
function normalizeAssetCode(code: string): string {
  const parts = code.split(":");
  return parts.length >= 2 ? (parts[1] as string) : code;
}

function extractAssets(rawResponse: unknown): string[] {
  if (typeof rawResponse !== "object" || rawResponse === null) {
    return [];
  }
  const { depositAssets, withdrawAssets, assets } = rawResponse as AssetBearingRawResponse;
  const merged = [
    ...(Array.isArray(depositAssets) ? depositAssets : []),
    ...(Array.isArray(withdrawAssets) ? withdrawAssets : []),
    ...(Array.isArray(assets) ? assets : []),
  ]
    .filter((value): value is string => typeof value === "string")
    .map(normalizeAssetCode);
  return Array.from(new Set(merged));
}

/** Anchors visible in the public directory, each with its most recent check status. */
export async function listPublicAnchorsWithStatus(db: Database): Promise<AnchorWithStatus[]> {
  const visibleAnchors = await db
    .select()
    .from(anchors)
    .where(eq(anchors.isHidden, false))
    .orderBy(anchors.displayName);

  if (visibleAnchors.length === 0) {
    return [];
  }

  const anchorIds = visibleAnchors.map((anchor) => anchor.id);

  // DISTINCT ON picks the most recent check_run per anchor in one query
  // instead of N+1 lookups.
  const latestRuns = await db
    .selectDistinctOn([checkRuns.anchorId], {
      anchorId: checkRuns.anchorId,
      checkRunId: checkRuns.id,
      status: checkRuns.status,
      startedAt: checkRuns.startedAt,
    })
    .from(checkRuns)
    .where(inArray(checkRuns.anchorId, anchorIds))
    .orderBy(checkRuns.anchorId, desc(checkRuns.startedAt));

  const latestByAnchorId = new Map(latestRuns.map((run) => [run.anchorId, run]));

  const latestRunIds = latestRuns
    .map((run) => run.checkRunId)
    .filter((id): id is string => id !== null);
  const assetResults = latestRunIds.length
    ? await db
        .select({
          checkRunId: sepCheckResults.checkRunId,
          sepType: sepCheckResults.sepType,
          rawResponse: sepCheckResults.rawResponse,
        })
        .from(sepCheckResults)
        .where(
          and(
            inArray(sepCheckResults.checkRunId, latestRunIds),
            inArray(sepCheckResults.sepType, ["sep6", "sep24", "sep38"]),
          ),
        )
    : [];

  const assetsByCheckRunId = new Map<string, Set<string>>();
  for (const result of assetResults) {
    const set = assetsByCheckRunId.get(result.checkRunId) ?? new Set<string>();
    for (const asset of extractAssets(result.rawResponse)) {
      set.add(asset);
    }
    assetsByCheckRunId.set(result.checkRunId, set);
  }

  return visibleAnchors.map((anchor) => {
    const latest = latestByAnchorId.get(anchor.id);
    const assets = latest?.checkRunId
      ? Array.from(assetsByCheckRunId.get(latest.checkRunId) ?? [])
      : [];
    return {
      ...anchor,
      latestStatus: latest?.status ?? null,
      lastCheckedAt: latest?.startedAt ?? null,
      assets,
    };
  });
}

export interface AnchorDetail {
  anchor: Anchor;
  uptimeHistory: {
    checkRunId: string;
    status: CheckRun["status"];
    startedAt: Date;
    avgLatencyMs: number | null;
  }[];
  latestSepResults: {
    sepType: string;
    passed: boolean;
    latencyMs: number | null;
    errorDetail: string | null;
  }[];
}

const UPTIME_WINDOW_DAYS = 90;

/** Full detail for one anchor's public page: 90-day history + latest SEP breakdown. */
export async function getPublicAnchorDetail(
  db: Database,
  slug: string,
): Promise<AnchorDetail | null> {
  const [anchor] = await db
    .select()
    .from(anchors)
    .where(and(eq(anchors.slug, slug), eq(anchors.isHidden, false)));
  if (!anchor) {
    return null;
  }

  const windowStart = new Date(Date.now() - UPTIME_WINDOW_DAYS * 24 * 60 * 60 * 1000);

  const uptimeHistory = await db
    .select({
      checkRunId: checkRuns.id,
      status: checkRuns.status,
      startedAt: checkRuns.startedAt,
      // Cast to int4 — Postgres numeric/avg() otherwise comes back from the
      // driver as a string, not a JS number.
      avgLatencyMs: sql<number | null>`round(avg(${sepCheckResults.latencyMs}))::int`,
    })
    .from(checkRuns)
    .leftJoin(sepCheckResults, eq(sepCheckResults.checkRunId, checkRuns.id))
    .where(
      and(
        eq(checkRuns.anchorId, anchor.id),
        sql`${checkRuns.startedAt} >= ${windowStart.toISOString()}`,
      ),
    )
    .groupBy(checkRuns.id)
    .orderBy(desc(checkRuns.startedAt));

  const latestRunId = uptimeHistory[0]?.checkRunId;
  const latestSepResults = latestRunId
    ? await db
        .select({
          sepType: sepCheckResults.sepType,
          passed: sepCheckResults.passed,
          latencyMs: sepCheckResults.latencyMs,
          errorDetail: sepCheckResults.errorDetail,
        })
        .from(sepCheckResults)
        .where(eq(sepCheckResults.checkRunId, latestRunId))
    : [];

  return { anchor, uptimeHistory, latestSepResults };
}
