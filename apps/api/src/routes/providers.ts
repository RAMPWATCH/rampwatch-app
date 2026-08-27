import { Router } from "express";
import { getDb } from "../db/client";
import { requireInternalSecret, requireOperatorContext } from "../middleware/internalAuth";
import { createProvider, findProviderByAddress } from "../db/queries/providers";
import { issueSep10Challenge, verifySep10Challenge } from "../lib/sep10";

export const providersRouter = Router();

providersRouter.use(requireInternalSecret);
providersRouter.use(requireOperatorContext);

/** Issue SEP-10 challenge for provider verification */
providersRouter.post("/operator/provider/sep10/challenge", async (req, res) => {
  try {
    const userId = req.operatorUserId;
    if (!userId) {
      res.status(401).json({ error: "missing user context" });
      return;
    }

    const { stellar_address } = req.body;
    if (!stellar_address) {
      res.status(400).json({ error: "stellar_address is required" });
      return;
    }

    // Issue SEP-10 challenge
    const challenge = await issueSep10Challenge(stellar_address);

    res.json({
      transaction: challenge.transaction,
      network_passphrase: challenge.network_passphrase,
    });
  } catch (error) {
    console.error("[POST /api/v1/operator/provider/sep10/challenge]", error);
    res.status(500).json({ error: "failed to issue challenge" });
  }
});

/** Verify SEP-10 challenge and register provider */
providersRouter.post("/operator/provider/sep10/verify", async (req, res) => {
  try {
    const userId = req.operatorUserId;
    if (!userId) {
      res.status(401).json({ error: "missing user context" });
      return;
    }

    const { transaction_envelope } = req.body;
    if (!transaction_envelope) {
      res.status(400).json({ error: "transaction_envelope is required" });
      return;
    }

    // Verify SEP-10 challenge
    const verification = await verifySep10Challenge(transaction_envelope);
    if (!verification.verified) {
      res.status(401).json({ error: "challenge verification failed" });
      return;
    }

    const stellar_address = verification.address;

    // Check if provider already exists
    const db = await getDb();
    let provider = await findProviderByAddress(db, stellar_address);

    if (!provider) {
      // Create new provider
      provider = await createProvider(db, {
        userId,
        stellarAddress: stellar_address,
        displayName: stellar_address,
        verificationTier: "sep10", // Mark as SEP-10 verified
        status: "active",
      });
    }

    res.json({
      provider: {
        id: provider.id,
        stellar_address: provider.stellarAddress,
        verification_tier: provider.verificationTier,
        status: provider.status,
      },
    });
  } catch (error) {
    console.error("[POST /api/v1/operator/provider/sep10/verify]", error);
    res.status(500).json({ error: "verification failed" });
  }
});
