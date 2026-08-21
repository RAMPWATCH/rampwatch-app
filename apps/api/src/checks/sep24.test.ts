import { describe, expect, it } from "vitest";
import { checkSep1 } from "./toml";
import { checkSep24 } from "./sep24";
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

describe("checkSep24", () => {
  it("validates /info and interactive-endpoint reachability against the SDF testnet anchor", async () => {
    const sep1 = await checkSep1(SDF_TESTNET_ANCHOR_DOMAIN, FETCH_OPTIONS);
    expect(sep1.outcome.passed).toBe(true);

    const result = await checkSep24(sep1.endpoints, FETCH_OPTIONS);

    expect(result.sepType).toBe("sep24");
    expect(result.errorDetail).toBeNull();
    expect(result.passed).toBe(true);
    const raw = result.rawResponse as {
      depositAssets: string[];
      withdrawAssets: string[];
      interactiveEndpointStatus: number;
    };
    expect(raw.depositAssets).toContain("USDC");
    expect(raw.interactiveEndpointStatus).toBeGreaterThanOrEqual(400);
    expect(raw.interactiveEndpointStatus).toBeLessThan(500);
  });

  it("fails cleanly when stellar.toml has no TRANSFER_SERVER_SEP0024", async () => {
    const result = await checkSep24(EMPTY_ENDPOINTS);

    expect(result.passed).toBe(false);
    expect(result.errorDetail).toContain("TRANSFER_SERVER_SEP0024");
  });
});
