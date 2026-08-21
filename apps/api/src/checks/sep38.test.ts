import { describe, expect, it } from "vitest";
import { checkSep1 } from "./toml";
import { checkSep38 } from "./sep38";
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

describe("checkSep38", () => {
  it("validates /info and /prices against the SDF testnet anchor", async () => {
    const sep1 = await checkSep1(SDF_TESTNET_ANCHOR_DOMAIN, FETCH_OPTIONS);
    expect(sep1.outcome.passed).toBe(true);

    const result = await checkSep38(sep1.endpoints, FETCH_OPTIONS);

    expect(result.sepType).toBe("sep38");
    expect(result.errorDetail).toBeNull();
    expect(result.passed).toBe(true);
    const raw = result.rawResponse as { assets: string[]; pricesChecked: boolean };
    expect(raw.assets.length).toBeGreaterThan(0);
    expect(typeof raw.pricesChecked).toBe("boolean");
  });

  it("fails cleanly when stellar.toml has no ANCHOR_QUOTE_SERVER", async () => {
    const result = await checkSep38(EMPTY_ENDPOINTS);

    expect(result.passed).toBe(false);
    expect(result.errorDetail).toContain("ANCHOR_QUOTE_SERVER");
  });
});
