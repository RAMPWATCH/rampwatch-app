import { afterAll, beforeAll, describe, expect, it } from "vitest";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { persistCheckRun } from "./checkRuns";
import { checkRuns, sepCheckResults } from "../schema";
import type { CheckRunResult } from "../../checks/orchestrate";
import { eq } from "drizzle-orm";

const dirname = path.dirname(fileURLToPath(import.meta.url));
const migrationsFolder = path.join(dirname, "..", "migrations");

// Exercises the real write path against a real (embedded) Postgres engine
// rather than mocking the query builder.
describe("persistCheckRun", () => {
  let db: Awaited<ReturnType<typeof import("../client").getDb>>;
  let client: import("@electric-sql/pglite").PGlite;

  beforeAll(async () => {
    const { drizzle } = await import("drizzle-orm/pglite");
    const { PGlite } = await import("@electric-sql/pglite");
    const { migrate } = await import("drizzle-orm/pglite/migrator");

    client = new PGlite();
    db = drizzle(client) as unknown as Awaited<ReturnType<typeof import("../client").getDb>>;
    await migrate(db as never, { migrationsFolder });
  });

  afterAll(async () => {
    await client.close();
  });

  it("writes a check_runs row and one sep_check_results row per outcome", async () => {
    const result: CheckRunResult = {
      domain: "example-anchor.test",
      status: "degraded",
      startedAt: new Date("2026-08-21T00:00:00Z"),
      completedAt: new Date("2026-08-21T00:00:05Z"),
      outcomes: [
        { sepType: "sep1", passed: true, latencyMs: 120, errorDetail: null, rawResponse: { ok: true } },
        { sepType: "sep6", passed: false, latencyMs: 340, errorDetail: "HTTP 500", rawResponse: null },
      ],
    };

    const { checkRunId } = await persistCheckRun(db, {
      anchorId: null,
      triggeredBy: "admin_manual",
      result,
    });

    expect(checkRunId).toBeTruthy();

    const [runRow] = await db.select().from(checkRuns).where(eq(checkRuns.id, checkRunId));
    expect(runRow?.status).toBe("degraded");
    expect(runRow?.domain).toBe("example-anchor.test");

    const resultRows = await db
      .select()
      .from(sepCheckResults)
      .where(eq(sepCheckResults.checkRunId, checkRunId));
    expect(resultRows).toHaveLength(2);
    expect(resultRows.map((row) => row.sepType).sort()).toEqual(["sep1", "sep6"]);
  });
});
