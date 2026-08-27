import { and, desc, eq, inArray, sql } from "drizzle-orm";
import type { Database } from "../client";
import { anchors, checkRuns, sepCheckResults, type Anchor, type CheckRun } from "../schema";

export interface OperatorAnchorSummary extends Anchor {
  latestStatus: CheckRun["status"] | null;
  lastCheckedAt: CheckRun["startedAt"] | null;
}

/** Every anchor claimed by this user — no is_hidden filter, this is the owner's own view. */
export async function listAnchorsForOperator(
  db: Database,
  userId: string,
): Promise<OperatorAnchorSummary[]> {
  const owned = await db.select().from(anchors).where(eq(anchors.claimedByUserId, userId));
  if (owned.length === 0) {
    return [];
  }

  const anchorIds = owned.map((anchor) => anchor.id);
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

  return owned.map((anchor) => {
    const latest = latestByAnchorId.get(anchor.id);
    return {
      ...anchor,
      latestStatus: latest?.status ?? null,
      lastCheckedAt: latest?.startedAt ?? null,
    };
  });
}

/** Confirms `userId` owns the anchor at `slug`; returns it or null otherwise. */
export async function findOwnedAnchorBySlug(
  db: Database,
  slug: string,
  userId: string,
): Promise<Anchor | null> {
  const [anchor] = await db
    .select()
    .from(anchors)
    .where(and(eq(anchors.slug, slug), eq(anchors.claimedByUserId, userId)));
  return anchor ?? null;
}

export interface FullHistoryEntry {
  checkRunId: string;
  status: CheckRun["status"];
  startedAt: Date;
  avgLatencyMs: number | null;
}

/** Full, unwindowed check history for an anchor (operator view — no 90-day cap). */
export async function getFullCheckHistory(
  db: Database,
  anchorId: string,
): Promise<FullHistoryEntry[]> {
  return db
    .select({
      checkRunId: checkRuns.id,
      status: checkRuns.status,
      startedAt: checkRuns.startedAt,
      avgLatencyMs: sql<number | null>`round(avg(${sepCheckResults.latencyMs}))::int`,
    })
    .from(checkRuns)
    .leftJoin(sepCheckResults, eq(sepCheckResults.checkRunId, checkRuns.id))
    .where(eq(checkRuns.anchorId, anchorId))
    .groupBy(checkRuns.id)
    .orderBy(desc(checkRuns.startedAt));
}
