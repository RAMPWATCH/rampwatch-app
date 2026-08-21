import { eq } from "drizzle-orm";
import { Keypair } from "@stellar/stellar-sdk";
import type { Database } from "../client";
import { platformSettings, PLATFORM_SETTINGS_ROW_ID, type PlatformSettings } from "../schema";

/**
 * Returns the single platform_settings row, seeding it on first run.
 * payto_address is NOT NULL with no natural default — if STELLAR_PAYTO_ADDRESS
 * isn't set yet (expected during early Stage A/B development, before a real
 * receiving address exists), we seed with a freshly generated placeholder
 * keypair so the row is well-formed, and log loudly that it must be
 * replaced via /admin/pricing before any paid x402 check is enabled.
 */
export async function getOrSeedPlatformSettings(db: Database): Promise<PlatformSettings> {
  const [existing] = await db
    .select()
    .from(platformSettings)
    .where(eq(platformSettings.id, PLATFORM_SETTINGS_ROW_ID));
  if (existing) {
    return existing;
  }

  let paytoAddress = process.env.STELLAR_PAYTO_ADDRESS;
  if (!paytoAddress) {
    paytoAddress = Keypair.random().publicKey();
    console.warn(
      "[platform_settings] STELLAR_PAYTO_ADDRESS is not set — seeded with a " +
        `placeholder address (${paytoAddress}). Replace it via /admin/pricing ` +
        "before enabling any paid x402 endpoint.",
    );
  }

  const [seeded] = await db
    .insert(platformSettings)
    .values({ id: PLATFORM_SETTINGS_ROW_ID, paytoAddress })
    .returning();
  if (!seeded) {
    throw new Error("failed to seed platform_settings");
  }
  return seeded;
}
