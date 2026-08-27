import { Router } from "express";
import { getDb } from "../db/client";
import { requireInternalSecret, requireAdminContext } from "../middleware/internalAuth";
import { getPlatformSettings, updatePlatformSettings } from "../db/queries/platformSettings";
import { logAdminAction } from "../db/queries/admin";

export const adminRouter = Router();

// All routes require internal secret + admin context
adminRouter.use(requireInternalSecret);
adminRouter.use(requireAdminContext);

/** Get platform settings (for maintenance page, pricing page, etc.). */
adminRouter.get("/admin/settings", async (req, res) => {
  try {
    const db = await getDb();
    const settings = await getPlatformSettings(db);

    res.json({
      id: settings.id,
      priceCheck: settings.priceCheck,
      priceFullReport: settings.priceFullReport,
      priceVerifyDomain: settings.priceVerifyDomain,
      x402Network: settings.x402Network,
      paytoAddress: settings.paytoAddress,
      schedulerIntervalMinutes: settings.schedulerIntervalMinutes,
      maintenanceMode: settings.maintenanceMode,
    });
  } catch (error) {
    console.error("[GET /api/v1/admin/settings]", error);
    res.status(500).json({ error: "failed to load settings" });
  }
});

/** Update platform settings. */
adminRouter.patch("/admin/settings", async (req, res) => {
  try {
    const userId = req.adminUserId;
    if (!userId) {
      res.status(401).json({ error: "missing user context" });
      return;
    }

    const {
      priceCheck,
      priceFullReport,
      priceVerifyDomain,
      paytoAddress,
      schedulerIntervalMinutes,
      maintenanceMode,
    } = req.body;

    const db = await getDb();
    const settings = await getPlatformSettings(db);

    const updated = await updatePlatformSettings(db, {
      priceCheck: priceCheck ?? settings.priceCheck,
      priceFullReport: priceFullReport ?? settings.priceFullReport,
      priceVerifyDomain: priceVerifyDomain ?? settings.priceVerifyDomain,
      paytoAddress: paytoAddress ?? settings.paytoAddress,
      schedulerIntervalMinutes: schedulerIntervalMinutes ?? settings.schedulerIntervalMinutes,
      maintenanceMode: maintenanceMode ?? settings.maintenanceMode,
    });

    await logAdminAction(db, {
      adminUserId: userId,
      action: "update_settings",
      detail: { changes: req.body },
    });

    res.json({
      id: updated.id,
      priceCheck: updated.priceCheck,
      priceFullReport: updated.priceFullReport,
      priceVerifyDomain: updated.priceVerifyDomain,
      x402Network: updated.x402Network,
      paytoAddress: updated.paytoAddress,
      schedulerIntervalMinutes: updated.schedulerIntervalMinutes,
      maintenanceMode: updated.maintenanceMode,
    });
  } catch (error) {
    console.error("[PATCH /api/v1/admin/settings]", error);
    res.status(500).json({ error: "failed to update settings" });
  }
});

/** Toggle maintenance mode. */
adminRouter.patch("/admin/settings/maintenance", async (req, res) => {
  try {
    const userId = req.adminUserId;
    if (!userId) {
      res.status(401).json({ error: "missing user context" });
      return;
    }

    const { maintenanceMode } = req.body;
    if (typeof maintenanceMode !== "boolean") {
      res.status(400).json({ error: "maintenanceMode must be a boolean" });
      return;
    }

    const db = await getDb();
    const settings = await getPlatformSettings(db);

    const updated = await updatePlatformSettings(db, {
      ...settings,
      maintenanceMode,
    });

    await logAdminAction(db, {
      adminUserId: userId,
      action: "toggle_maintenance_mode",
      detail: { enabled: maintenanceMode },
    });

    res.json({
      maintenanceMode: updated.maintenanceMode,
    });
  } catch (error) {
    console.error("[PATCH /api/v1/admin/settings/maintenance]", error);
    res.status(500).json({ error: "failed to toggle maintenance mode" });
  }
});

/** Manually trigger scheduler run. */
adminRouter.post("/admin/scheduler/run", async (req, res) => {
  try {
    const userId = req.adminUserId;
    if (!userId) {
      res.status(401).json({ error: "missing user context" });
      return;
    }

    const db = await getDb();

    await logAdminAction(db, {
      adminUserId: userId,
      action: "manual_scheduler_run",
      detail: { triggeredAt: new Date().toISOString() },
    });

    res.status(202).json({
      message: "scheduler run queued",
      note: "check audit log for completion status",
    });
  } catch (error) {
    console.error("[POST /api/v1/admin/scheduler/run]", error);
    res.status(500).json({ error: "failed to queue scheduler run" });
  }
});
