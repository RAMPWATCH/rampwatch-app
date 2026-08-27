import { Router } from "express";
import { getDb } from "../db/client";
import { requireInternalSecret, requireOperatorContext } from "../middleware/internalAuth";
import { listAnchorsForOperator, findOwnedAnchorBySlug, getFullCheckHistory } from "../db/queries/operatorAnchors";
import { startClaim, getPendingVerification, markVerified } from "../db/queries/domainVerifications";
import { checkDnsTxt, checkWellKnownFile } from "../lib/domainVerification";
import { listAlertsForAnchor, createAlert, findAlertForAnchor, updateAlert, deleteAlert } from "../db/queries/alertConfigs";
import { findUserById, updateUserPassword } from "../db/queries/users";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

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

/** Start a domain verification claim for a new or existing anchor. */
operatorRouter.post("/operator/anchors/claim", async (req, res) => {
  try {
    const userId = req.operatorUserId;
    if (!userId) {
      res.status(401).json({ error: "missing user context" });
      return;
    }

    const { domain, network, method } = req.body;
    if (!domain || !network || !method) {
      res.status(400).json({ error: "domain, network, and method are required" });
      return;
    }

    const db = await getDb();
    const result = await startClaim(db, { userId, domain, network, method });

    if (!result.ok) {
      res.status(400).json({ error: result.error });
      return;
    }

    res.status(201).json({
      anchor: {
        id: result.anchor.id,
        slug: result.anchor.slug,
        domain: result.anchor.domain,
      },
      verification: {
        id: result.verification.id,
        token: result.verification.verificationToken,
        method: result.verification.method,
      },
    });
  } catch (error) {
    console.error("[POST /api/v1/operator/anchors/claim]", error);
    res.status(500).json({ error: "failed to start claim" });
  }
});

/** Get the pending verification for an anchor being claimed by this operator. */
operatorRouter.get("/operator/anchors/:slug/verify", async (req, res) => {
  try {
    const userId = req.operatorUserId;
    if (!userId) {
      res.status(401).json({ error: "missing user context" });
      return;
    }

    const db = await getDb();
    const anchor = await findOwnedAnchorBySlug(db, req.params.slug, userId);
    if (!anchor) {
      res.status(404).json({ error: "anchor not found" });
      return;
    }

    const verification = await getPendingVerification(db, anchor.id, userId);
    if (!verification) {
      res.status(404).json({ error: "no pending verification" });
      return;
    }

    res.json({
      verification: {
        id: verification.id,
        token: verification.verificationToken,
        method: verification.method,
        createdAt: verification.createdAt,
      },
    });
  } catch (error) {
    console.error("[GET /api/v1/operator/anchors/:slug/verify]", error);
    res.status(500).json({ error: "failed to get verification status" });
  }
});

/** Perform the verification check and mark the domain as claimed if successful. */
operatorRouter.post("/operator/anchors/:slug/verify", async (req, res) => {
  try {
    const userId = req.operatorUserId;
    if (!userId) {
      res.status(401).json({ error: "missing user context" });
      return;
    }

    const db = await getDb();
    const anchor = await findOwnedAnchorBySlug(db, req.params.slug, userId);
    if (!anchor) {
      res.status(404).json({ error: "anchor not found" });
      return;
    }

    const verification = await getPendingVerification(db, anchor.id, userId);
    if (!verification) {
      res.status(404).json({ error: "no pending verification" });
      return;
    }

    let checkResult;
    if (verification.method === "dns_txt") {
      checkResult = await checkDnsTxt(anchor.domain, verification.verificationToken);
    } else {
      checkResult = await checkWellKnownFile(anchor.domain, verification.verificationToken);
    }

    if (!checkResult.verified) {
      res.status(400).json({
        verified: false,
        detail: checkResult.detail,
      });
      return;
    }

    await markVerified(db, {
      anchorId: anchor.id,
      userId,
      verificationId: verification.id,
    });

    res.json({
      verified: true,
      detail: checkResult.detail,
      anchor: {
        id: anchor.id,
        slug: anchor.slug,
        domain: anchor.domain,
      },
    });
  } catch (error) {
    console.error("[POST /api/v1/operator/anchors/:slug/verify]", error);
    res.status(500).json({ error: "verification check failed" });
  }
});

/** List all alerts for an anchor owned by this operator. */
operatorRouter.get("/operator/anchors/:slug/alerts", async (req, res) => {
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

    const alerts = await listAlertsForAnchor(db, anchor.id);
    res.json({
      alerts: alerts.map((alert) => ({
        id: alert.id,
        channel: alert.channel,
        destination: alert.destination,
        isActive: alert.isActive,
      })),
    });
  } catch (error) {
    console.error("[GET /api/v1/operator/anchors/:slug/alerts]", error);
    res.status(500).json({ error: "failed to load alerts" });
  }
});

/** Create a new alert for an anchor. */
operatorRouter.post("/operator/anchors/:slug/alerts", async (req, res) => {
  try {
    const userId = req.operatorUserId;
    if (!userId) {
      res.status(401).json({ error: "missing user context" });
      return;
    }

    const { channel, destination } = req.body;
    if (!channel || !destination) {
      res.status(400).json({ error: "channel and destination are required" });
      return;
    }

    if (!["email", "webhook"].includes(channel)) {
      res.status(400).json({ error: "channel must be 'email' or 'webhook'" });
      return;
    }

    const db = await getDb();
    const anchor = await findOwnedAnchorBySlug(db, req.params.slug, userId);
    if (!anchor) {
      res.status(404).json({ error: "anchor not found or not claimed by this user" });
      return;
    }

    const alert = await createAlert(db, { anchorId: anchor.id, channel, destination });
    res.status(201).json({
      id: alert.id,
      channel: alert.channel,
      destination: alert.destination,
      isActive: alert.isActive,
    });
  } catch (error) {
    console.error("[POST /api/v1/operator/anchors/:slug/alerts]", error);
    res.status(500).json({ error: "failed to create alert" });
  }
});

/** Update an alert. */
operatorRouter.put("/operator/anchors/:slug/alerts/:alertId", async (req, res) => {
  try {
    const userId = req.operatorUserId;
    if (!userId) {
      res.status(401).json({ error: "missing user context" });
      return;
    }

    const { destination, isActive } = req.body;

    const db = await getDb();
    const anchor = await findOwnedAnchorBySlug(db, req.params.slug, userId);
    if (!anchor) {
      res.status(404).json({ error: "anchor not found or not claimed by this user" });
      return;
    }

    const alert = await updateAlert(db, {
      id: req.params.alertId,
      anchorId: anchor.id,
      destination,
      isActive,
    });

    if (!alert) {
      res.status(404).json({ error: "alert not found" });
      return;
    }

    res.json({
      id: alert.id,
      channel: alert.channel,
      destination: alert.destination,
      isActive: alert.isActive,
    });
  } catch (error) {
    console.error("[PUT /api/v1/operator/anchors/:slug/alerts/:alertId]", error);
    res.status(500).json({ error: "failed to update alert" });
  }
});

/** Delete an alert. */
operatorRouter.delete("/operator/anchors/:slug/alerts/:alertId", async (req, res) => {
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

    const deleted = await deleteAlert(db, { id: req.params.alertId, anchorId: anchor.id });
    if (!deleted) {
      res.status(404).json({ error: "alert not found" });
      return;
    }

    res.status(204).send();
  } catch (error) {
    console.error("[DELETE /api/v1/operator/anchors/:slug/alerts/:alertId]", error);
    res.status(500).json({ error: "failed to delete alert" });
  }
});

/** Get current user info. */
operatorRouter.get("/operator/me", async (req, res) => {
  try {
    const userId = req.operatorUserId;
    if (!userId) {
      res.status(401).json({ error: "missing user context" });
      return;
    }

    const db = await getDb();
    const user = await findUserById(db, userId);
    if (!user) {
      res.status(404).json({ error: "user not found" });
      return;
    }

    res.json({
      id: user.id,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      lastLoginAt: user.lastLoginAt,
    });
  } catch (error) {
    console.error("[GET /api/v1/operator/me]", error);
    res.status(500).json({ error: "failed to load user" });
  }
});

/** Change user password. */
operatorRouter.post("/operator/me/password", async (req, res) => {
  try {
    const userId = req.operatorUserId;
    if (!userId) {
      res.status(401).json({ error: "missing user context" });
      return;
    }

    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      res.status(400).json({ error: "currentPassword and newPassword are required" });
      return;
    }

    if (newPassword.length < 8) {
      res.status(400).json({ error: "password must be at least 8 characters" });
      return;
    }

    const db = await getDb();
    const user = await findUserById(db, userId);
    if (!user) {
      res.status(404).json({ error: "user not found" });
      return;
    }

    const [storedSalt, storedHash] = user.passwordHash.split(":");
    const testHash = (await scryptAsync(currentPassword, storedSalt, 64)).toString("hex");
    if (testHash !== storedHash) {
      res.status(401).json({ error: "current password is incorrect" });
      return;
    }

    const salt = randomBytes(16).toString("hex");
    const newHash = (await scryptAsync(newPassword, salt, 64)).toString("hex");
    const newPasswordHash = `${salt}:${newHash}`;

    await updateUserPassword(db, userId, newPasswordHash);

    res.json({ message: "password updated successfully" });
  } catch (error) {
    console.error("[POST /api/v1/operator/me/password]", error);
    res.status(500).json({ error: "failed to change password" });
  }
});
