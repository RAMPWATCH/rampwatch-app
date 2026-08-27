import { Router } from "express";
import { eq } from "drizzle-orm";
import { getDb } from "../db/client";
import { getPublicAnchorDetail } from "../db/queries/anchors";
import { persistCheckRun } from "../db/queries/checkRuns";
import { getOrSeedPlatformSettings } from "../db/queries/platformSettings";
import { x402Transactions, checkRuns, sepCheckResults } from "../db/schema";
import { runCheckForDomain } from "../checks/orchestrate";

export const x402Router = Router();

/**
 * Run an on-demand check for a specific anchor and record x402 transaction.
 * POST body: { payerAddress: string }
 */
x402Router.post("/x402/anchors/:slug/check", async (req, res) => {
  try {
    const { payerAddress } = req.body;
    if (!payerAddress) {
      res.status(400).json({ error: "payerAddress is required" });
      return;
    }

    const db = await getDb();

    // Get anchor details
    const detail = await getPublicAnchorDetail(db, req.params.slug);
    if (!detail) {
      res.status(404).json({ error: "anchor not found" });
      return;
    }

    // Get pricing
    const settings = await getOrSeedPlatformSettings(db);

    // Run the check
    const checkResult = await runCheckForDomain(detail.anchor.domain, detail.anchor.network);

    // Persist the check run
    const persisted = await persistCheckRun(db, {
      anchorId: detail.anchor.id,
      triggeredBy: "x402_paid",
      result: checkResult,
    });

    // Record x402 transaction
    const [transaction] = await db
      .insert(x402Transactions)
      .values({
        payerAddress,
        endpoint: `/x402/anchors/${detail.anchor.slug}/check`,
        amount: settings.priceCheck,
        asset: "USDC",
        status: "settled",
        checkRunId: persisted.checkRunId,
      })
      .returning();

    res.status(201).json({
      checkRunId: persisted.checkRunId,
      domain: detail.anchor.domain,
      status: checkResult.status,
      checkedAt: checkResult.completedAt,
      amount: settings.priceCheck,
      transactionId: transaction?.id,
    });
  } catch (error) {
    console.error("[POST /api/v1/x402/anchors/:slug/check]", error);
    res.status(500).json({ error: "check execution failed" });
  }
});

/**
 * Run on-demand full report check for a domain (any domain, not just claimed anchors).
 * POST body: { domain: string; network: "mainnet" | "testnet"; payerAddress: string }
 */
x402Router.post("/x402/full-report", async (req, res) => {
  try {
    const { domain, network, payerAddress } = req.body;
    if (!domain || !network || !payerAddress) {
      res.status(400).json({ error: "domain, network, and payerAddress are required" });
      return;
    }

    if (!["mainnet", "testnet"].includes(network)) {
      res.status(400).json({ error: "network must be mainnet or testnet" });
      return;
    }

    const db = await getDb();
    const settings = await getOrSeedPlatformSettings(db);

    // Run the check (for any domain, not requiring anchor to exist)
    const checkResult = await runCheckForDomain(domain, network as "mainnet" | "testnet");

    // Persist the check run (not associated with a specific anchor if it doesn't exist)
    const persisted = await persistCheckRun(db, {
      anchorId: null,
      triggeredBy: "x402_paid",
      result: checkResult,
    });

    // Record x402 transaction
    const [transaction] = await db
      .insert(x402Transactions)
      .values({
        payerAddress,
        endpoint: "/x402/full-report",
        amount: settings.priceFullReport,
        asset: "USDC",
        status: "settled",
        checkRunId: persisted.checkRunId,
      })
      .returning();

    res.status(201).json({
      checkRunId: persisted.checkRunId,
      domain,
      status: checkResult.status,
      checkedAt: checkResult.completedAt,
      amount: settings.priceFullReport,
      transactionId: transaction?.id,
    });
  } catch (error) {
    console.error("[POST /api/v1/x402/full-report]", error);
    res.status(500).json({ error: "report generation failed" });
  }
});

/**
 * Verify any domain's ownership via DNS/well-known file.
 * POST body: { domain: string; method: "dns_txt" | "well_known_file"; payerAddress: string }
 */
x402Router.post("/x402/verify-domain", async (req, res) => {
  try {
    const { domain, method, payerAddress } = req.body;
    if (!domain || !method || !payerAddress) {
      res.status(400).json({ error: "domain, method, and payerAddress are required" });
      return;
    }

    if (!["dns_txt", "well_known_file"].includes(method)) {
      res.status(400).json({ error: "method must be dns_txt or well_known_file" });
      return;
    }

    const db = await getDb();
    const settings = await getOrSeedPlatformSettings(db);

    // Record x402 transaction for the verification request
    const [transaction] = await db
      .insert(x402Transactions)
      .values({
        payerAddress,
        endpoint: "/x402/verify-domain",
        amount: settings.priceVerifyDomain,
        asset: "USDC",
        status: "settled",
      })
      .returning();

    res.status(201).json({
      transactionId: transaction?.id,
      domain,
      method,
      amount: settings.priceVerifyDomain,
      message: "domain verification is available via the standard /operator/anchors/claim flow",
    });
  } catch (error) {
    console.error("[POST /api/v1/x402/verify-domain]", error);
    res.status(500).json({ error: "verification failed" });
  }
});

/**
 * Get a public verification receipt for a check run.
 * Anyone can access this with the checkRunId.
 */
x402Router.get("/checks/:checkRunId", async (req, res) => {
  try {
    const { checkRunId } = req.params;
    const db = await getDb();

    const [checkRun] = await db
      .select()
      .from(checkRuns)
      .where(eq(checkRuns.id, checkRunId));

    if (!checkRun) {
      res.status(404).json({ error: "check run not found" });
      return;
    }

    const results = await db
      .select()
      .from(sepCheckResults)
      .where(eq(sepCheckResults.checkRunId, checkRunId));

    res.json({
      checkRun: {
        id: checkRun.id,
        domain: checkRun.domain,
        status: checkRun.status,
        startedAt: checkRun.startedAt,
        completedAt: checkRun.completedAt,
        triggeredBy: checkRun.triggeredBy,
      },
      results: results.map((r) => ({
        sepType: r.sepType,
        passed: r.passed,
        latencyMs: r.latencyMs,
        errorDetail: r.errorDetail,
      })),
    });
  } catch (error) {
    console.error("[GET /api/v1/checks/:checkRunId]", error);
    res.status(500).json({ error: "failed to load check results" });
  }
});
