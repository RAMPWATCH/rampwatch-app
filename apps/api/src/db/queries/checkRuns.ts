import type { Database } from "../client";
import { checkRuns, sepCheckResults, type TriggeredBy } from "../schema";
import type { CheckRunResult } from "../../checks/orchestrate";

export interface PersistCheckRunParams {
  anchorId: string | null;
  triggeredBy: TriggeredBy;
  result: CheckRunResult;
}

export interface PersistedCheckRun {
  checkRunId: string;
}

/**
 * Writes a check_runs row plus one sep_check_results row per SEP that was
 * actually checked. Every field the caller passes in has already been
 * produced by never-throwing checkers, so the only thing that can fail
 * here is the database write itself — callers are expected to wrap this in
 * their own try/catch (scheduler, x402 routes) so a DB hiccup never takes
 * the whole run down.
 */
export async function persistCheckRun(
  db: Database,
  { anchorId, triggeredBy, result }: PersistCheckRunParams,
): Promise<PersistedCheckRun> {
  const [checkRun] = await db
    .insert(checkRuns)
    .values({
      anchorId,
      domain: result.domain,
      triggeredBy,
      status: result.status,
      startedAt: result.startedAt,
      completedAt: result.completedAt,
    })
    .returning();

  if (!checkRun) {
    throw new Error("insert into check_runs returned no row");
  }

  if (result.outcomes.length > 0) {
    await db.insert(sepCheckResults).values(
      result.outcomes.map((outcome) => ({
        checkRunId: checkRun.id,
        sepType: outcome.sepType,
        passed: outcome.passed,
        latencyMs: outcome.latencyMs,
        errorDetail: outcome.errorDetail,
        rawResponse: outcome.rawResponse,
      })),
    );
  }

  return { checkRunId: checkRun.id };
}
