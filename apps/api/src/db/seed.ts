import "dotenv/config";
import { getDb } from "./client";
import { anchors } from "./schema";

/**
 * Seeds a handful of real (non-mocked) domains for local development and
 * for the Stage A scheduler soak test. Only testanchor.stellar.org is a
 * full SEP-compliant reference anchor — the other two are real, live
 * Stellar-ecosystem domains that simply don't publish a stellar.toml, used
 * to exercise the "down" path against genuine network responses rather
 * than a mock.
 */
const SEED_ANCHORS = [
  {
    slug: "sdf-testanchor",
    domain: "testanchor.stellar.org",
    displayName: "SDF Reference Test Anchor",
    network: "testnet" as const,
  },
  {
    slug: "horizon-testnet",
    domain: "horizon-testnet.stellar.org",
    displayName: "Horizon Testnet (no anchor TOML)",
    network: "testnet" as const,
  },
  {
    slug: "stellar-org",
    domain: "stellar.org",
    displayName: "stellar.org (no anchor TOML)",
    network: "testnet" as const,
  },
];

async function run(): Promise<void> {
  const db = await getDb();
  for (const anchor of SEED_ANCHORS) {
    await db.insert(anchors).values(anchor).onConflictDoNothing({ target: anchors.slug });
    console.log(`seeded anchor: ${anchor.slug} (${anchor.domain})`);
  }
}

run()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("seed failed:", error);
    process.exit(1);
  });
