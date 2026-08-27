import { Router } from "express";
import { getDb } from "../db/client";
import { requireInternalSecret, requireOperatorContext } from "../middleware/internalAuth";
import { listAnchorsForOperator, findOwnedAnchorBySlug, getFullCheckHistory } from "../db/queries/operatorAnchors";

export const operatorRouter = Router();

// All routes require internal secret + operator context
operatorRouter.use(requireInternalSecret);
operatorRouter.use(requireOperatorContext);

/** List all anchors claimed by this operator. */
operatorRouter.get("/operator/anchors", async (req, res) => {
  try {
    const userId = req.operatorUserId;
    if (!userId) {
      res.status(401).json({ error: "missing user context" });
      return;
    }

    const db = await getDb();
    const operatorAnchors = await listAnchorsForOperator(db, userId);

    res.json({
      anchors: operatorAnchors.map((anchor) => ({
        id: anchor.id,
        slug: anchor.slug,
        domain: anchor.domain,
        displayName: anchor.displayName,
        network: anchor.network,
        claimStatus: anchor.claimStatus,
        status: anchor.latestStatus,
        lastCheckedAt: anchor.lastCheckedAt,
      })),
    });
  } catch (error) {
    console.error("[GET /api/v1/operator/anchors]", error);
    res.status(500).json({ error: "failed to load anchors" });
  }
});

/** Get detail for a specific anchor claimed by this operator. */
operatorRouter.get("/operator/anchors/:slug", async (req, res) => {
  try {
    const userId = req.operatorUserId;
    if (!userId) {
      res.status(401).json({ error: "missing user context" });
      return;
    }

    const db = await getDb();
    const anchor = await findOwnedAnchorBySlug(db, req.params.slug, userId);
    if (!anchor) {
      res.status(404).json({ error: "anchor not found or not claimed by this user" });
      return;
    }

    const history = await getFullCheckHistory(db, anchor.id);

    res.json({
      id: anchor.id,
      slug: anchor.slug,
      domain: anchor.domain,
      displayName: anchor.displayName,
      network: anchor.network,
      claimStatus: anchor.claimStatus,
      isHidden: anchor.isHidden,
      history: history.map((entry) => ({
        checkRunId: entry.checkRunId,
        status: entry.status,
        startedAt: entry.startedAt,
        avgLatencyMs: entry.avgLatencyMs,
      })),
    });
  } catch (error) {
    console.error("[GET /api/v1/operator/anchors/:slug]", error);
    res.status(500).json({ error: "failed to load anchor detail" });
  }
});
