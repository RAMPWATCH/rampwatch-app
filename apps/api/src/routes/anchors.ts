import { Router } from "express";
import { getDb } from "../db/client";
import { listPublicAnchorsWithStatus, getPublicAnchorDetail } from "../db/queries/anchors";

export const anchorsRouter = Router();

anchorsRouter.get("/anchors", async (_req, res) => {
  try {
    const db = await getDb();
    const anchorList = await listPublicAnchorsWithStatus(db);
    res.json({
      anchors: anchorList.map((anchor) => ({
        slug: anchor.slug,
        domain: anchor.domain,
        displayName: anchor.displayName,
        network: anchor.network,
        claimStatus: anchor.claimStatus,
        status: anchor.latestStatus,
        lastCheckedAt: anchor.lastCheckedAt,
        assets: anchor.assets,
      })),
    });
  } catch (error) {
    console.error("[GET /api/v1/anchors]", error);
    res.status(500).json({ error: "failed to load anchors" });
  }
});

anchorsRouter.get("/anchors/:slug", async (req, res) => {
  try {
    const db = await getDb();
    const detail = await getPublicAnchorDetail(db, req.params.slug);
    if (!detail) {
      res.status(404).json({ error: "anchor not found" });
      return;
    }

    res.json({
      slug: detail.anchor.slug,
      domain: detail.anchor.domain,
      displayName: detail.anchor.displayName,
      network: detail.anchor.network,
      claimStatus: detail.anchor.claimStatus,
      uptimeHistory: detail.uptimeHistory,
      latestSepResults: detail.latestSepResults,
    });
  } catch (error) {
    console.error("[GET /api/v1/anchors/:slug]", error);
    res.status(500).json({ error: "failed to load anchor detail" });
  }
});
