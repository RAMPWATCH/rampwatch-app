import { and, desc, eq, inArray, sql } from "drizzle-orm";
import type { Database } from "../client";
import { anchors, checkRuns, sepCheckResults, type Anchor, type CheckRun } from "../schema";

export interface AnchorWithStatus extends Anchor {
  latestStatus: CheckRun["status"] | null;
  lastCheckedAt: CheckRun["startedAt"] | null;
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
      status: checkRuns.status,
      startedAt: checkRuns.startedAt,
    })
    .from(checkRuns)
    .where(inArray(checkRuns.anchorId, anchorIds))
    .orderBy(checkRuns.anchorId, desc(checkRuns.startedAt));

  const latestByAnchorId = new Map(latestRuns.map((run) => [run.anchorId, run]));

  return visibleAnchors.map((anchor) => {
    const latest = latestByAnchorId.get(anchor.id);
    return {
      ...anchor,
      latestStatus: latest?.status ?? null,
      lastCheckedAt: latest?.startedAt ?? null,
    };
  });
}

export interface AnchorDetail {
  anchor: Anchor;
  uptimeHistory: { checkRunId: string; status: CheckRun["status"]; startedAt: Date }[];
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
    })
    .from(checkRuns)
    .where(
      and(
        eq(checkRuns.anchorId, anchor.id),
        sql`${checkRuns.startedAt} >= ${windowStart.toISOString()}`,
      ),
    )
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
