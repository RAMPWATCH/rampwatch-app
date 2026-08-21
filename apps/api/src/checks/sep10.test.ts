import { describe, expect, it } from "vitest";
import { checkSep1 } from "./toml";
import { checkSep10 } from "./sep10";
import type { StellarTomlEndpoints } from "./types";

const SDF_TESTNET_ANCHOR_DOMAIN = "testanchor.stellar.org";
const TESTNET_PASSPHRASE = "Test SDF Network ; September 2015";
const FETCH_OPTIONS = { retries: 5 };

describe("checkSep10", () => {
  it("verifies a real SEP-10 challenge from the SDF testnet anchor", async () => {
    const sep1 = await checkSep1(SDF_TESTNET_ANCHOR_DOMAIN, FETCH_OPTIONS);
    expect(sep1.outcome.passed).toBe(true);

    const result = await checkSep10(
      SDF_TESTNET_ANCHOR_DOMAIN,
      sep1.endpoints,
      TESTNET_PASSPHRASE,
      FETCH_OPTIONS,
    );

    expect(result.sepType).toBe("sep10");
    expect(result.errorDetail).toBeNull();
    expect(result.passed).toBe(true);
    expect(result.latencyMs).toBeGreaterThan(0);
  });

  it("fails cleanly when stellar.toml has no WEB_AUTH_ENDPOINT", async () => {
    const emptyEndpoints: StellarTomlEndpoints = {
      webAuthEndpoint: null,
      transferServerSep6: null,
      transferServerSep24: null,
      anchorQuoteServer: null,
      kycServer: null,
      signingKey: null,
      networkPassphrase: null,
    };

    const result = await checkSep10(
      "example.com",
      emptyEndpoints,
      TESTNET_PASSPHRASE,
    );

    expect(result.passed).toBe(false);
    expect(result.errorDetail).toContain("WEB_AUTH_ENDPOINT");
  });

  it("fails cleanly when the server signature doesn't match SIGNING_KEY", async () => {
    const sep1 = await checkSep1(SDF_TESTNET_ANCHOR_DOMAIN, FETCH_OPTIONS);
    expect(sep1.outcome.passed).toBe(true);

    const wrongKeyEndpoints: StellarTomlEndpoints = {
      ...sep1.endpoints,
      // A syntactically valid but unrelated public key.
      signingKey: "GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF",
    };

    const result = await checkSep10(
      SDF_TESTNET_ANCHOR_DOMAIN,
      wrongKeyEndpoints,
      TESTNET_PASSPHRASE,
      FETCH_OPTIONS,
    );

    expect(result.passed).toBe(false);
    expect(result.errorDetail).not.toBeNull();
  });
});
