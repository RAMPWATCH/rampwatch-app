import { describe, expect, it } from "vitest";
import { checkSep1 } from "./toml";
import { checkSep6 } from "./sep6";
import type { StellarTomlEndpoints } from "./types";

const SDF_TESTNET_ANCHOR_DOMAIN = "testanchor.stellar.org";
const FETCH_OPTIONS = { retries: 5 };

const EMPTY_ENDPOINTS: StellarTomlEndpoints = {
  webAuthEndpoint: null,
  transferServerSep6: null,
  transferServerSep24: null,
  anchorQuoteServer: null,
  kycServer: null,
  signingKey: null,
  networkPassphrase: null,
};

describe("checkSep6", () => {
  it("validates /info against the SDF testnet anchor", async () => {
    const sep1 = await checkSep1(SDF_TESTNET_ANCHOR_DOMAIN, FETCH_OPTIONS);
    expect(sep1.outcome.passed).toBe(true);

    const result = await checkSep6(sep1.endpoints, FETCH_OPTIONS);

    expect(result.sepType).toBe("sep6");
    expect(result.passed).toBe(true);
    expect(result.errorDetail).toBeNull();
    const raw = result.rawResponse as { depositAssets: string[]; withdrawAssets: string[] };
    expect(raw.depositAssets).toContain("USDC");
    expect(raw.withdrawAssets).toContain("USDC");
  });

  it("fails cleanly when stellar.toml has no TRANSFER_SERVER", async () => {
    const result = await checkSep6(EMPTY_ENDPOINTS);

    expect(result.passed).toBe(false);
    expect(result.errorDetail).toContain("TRANSFER_SERVER");
  });
});
