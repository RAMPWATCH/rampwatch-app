import { Router } from "express";
import { eq } from "drizzle-orm";
import { getDb } from "../db/client";
import { getOrSeedPlatformSettings } from "../db/queries/platformSettings";
import { anchors } from "../db/schema";

export const publicRouter = Router();

publicRouter.get("/stats", async (_req, res) => {
  try {
    const db = await getDb();
    const rows = await db
      .select({ id: anchors.id })
      .from(anchors)
      .where(eq(anchors.isHidden, false));
    res.json({ anchorsMonitored: rows.length });
  } catch (error) {
    console.error("[GET /api/v1/stats]", error);
    res.status(500).json({ error: "failed to load stats" });
  }
});

publicRouter.get("/pricing", async (_req, res) => {
  try {
    const db = await getDb();
    const settings = await getOrSeedPlatformSettings(db);
    res.json({
      priceCheck: settings.priceCheck,
      priceFullReport: settings.priceFullReport,
      priceVerifyDomain: settings.priceVerifyDomain,
      asset: "USDC",
      network: settings.x402Network,
    });
  } catch (error) {
    console.error("[GET /api/v1/pricing]", error);
    res.status(500).json({ error: "failed to load pricing" });
  }
});
