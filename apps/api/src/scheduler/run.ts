import "dotenv/config";
import { getDb, type Database } from "../db/client";
import { anchors } from "../db/schema";
import { getOrSeedPlatformSettings } from "../db/queries/platformSettings";
import { runCheckForDomain } from "../checks/orchestrate";
import { persistCheckRun } from "../db/queries/checkRuns";

const MAX_BACKOFF_MULTIPLIER = 8;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function runTick(db: Database): Promise<void> {
  const allAnchors = await db.select().from(anchors);

  for (const anchor of allAnchors) {
    try {
      // Background checks aren't latency-sensitive like an x402 on-demand
      // check, so absorb more transient network blips before calling an
      // anchor down.
      const result = await runCheckForDomain(anchor.domain, anchor.network, {
        retries: 4,
      });
      const { checkRunId } = await persistCheckRun(db, {
        anchorId: anchor.id,
        triggeredBy: "scheduler",
        result,
      });
      console.log(
        `[scheduler] ${anchor.domain}: ${result.status} (check_run=${checkRunId})`,
      );
    } catch (error) {
      // The checkers themselves never throw (see checks/http.ts), so this
      // catch is the last line of defense — e.g. a DB write blip — and
      // exists purely so one anchor's failure never takes the scheduler
      // process down.
      console.error(`[scheduler] unhandled error checking ${anchor.domain}:`, error);
    }
  }
}

async function main(): Promise<void> {
  const db = await getDb();
  const settings = await getOrSeedPlatformSettings(db);
  const intervalMs = settings.schedulerIntervalMinutes * 60_000;
  const maxTicks = process.env.SCHEDULER_MAX_TICKS
    ? Number(process.env.SCHEDULER_MAX_TICKS)
    : null;

  console.log(
    `[scheduler] starting, interval=${settings.schedulerIntervalMinutes}min` +
      (maxTicks ? `, maxTicks=${maxTicks}` : ""),
  );

  process.on("unhandledRejection", (reason) => {
    console.error("[scheduler] unhandled rejection:", reason);
  });
  process.on("uncaughtException", (error) => {
    console.error("[scheduler] uncaught exception:", error);
  });

  let consecutiveTickFailures = 0;
  let ticksRun = 0;

  for (;;) {
    try {
      await runTick(db);
      consecutiveTickFailures = 0;
    } catch (error) {
      consecutiveTickFailures += 1;
      console.error(
        `[scheduler] tick failed (consecutive failures=${consecutiveTickFailures}):`,
        error,
      );
    }

    ticksRun += 1;
    if (maxTicks !== null && ticksRun >= maxTicks) {
      console.log(`[scheduler] reached SCHEDULER_MAX_TICKS=${maxTicks}, exiting`);
      return;
    }

    const backoffMultiplier =
      consecutiveTickFailures > 0
        ? Math.min(2 ** consecutiveTickFailures, MAX_BACKOFF_MULTIPLIER)
        : 1;
    await sleep(intervalMs * backoffMultiplier);
  }
}

main().catch((error) => {
  console.error("[scheduler] fatal error during startup:", error);
  process.exitCode = 1;
});
