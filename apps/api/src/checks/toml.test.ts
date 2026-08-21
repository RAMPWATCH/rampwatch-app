import { describe, expect, it } from "vitest";
import { checkSep1 } from "./toml";

// Live integration test against the SDF's public reference test anchor —
// intentionally not mocked, per the "no stubs" build rule for Stage A.
const SDF_TESTNET_ANCHOR_DOMAIN = "testanchor.stellar.org";

describe("checkSep1", () => {
  it("fetches and parses the SDF testnet anchor's stellar.toml", async () => {
    // Extra retries here purely to absorb this sandbox's occasional
    // last-mile packet loss on outbound IPv4 — production/CI networking
    // doesn't need this many.
    const result = await checkSep1(SDF_TESTNET_ANCHOR_DOMAIN, { retries: 5 });

    expect(result.outcome.sepType).toBe("sep1");
    expect(result.outcome.passed).toBe(true);
    expect(result.outcome.errorDetail).toBeNull();
    expect(result.outcome.latencyMs).toBeGreaterThan(0);

    expect(result.endpoints.webAuthEndpoint).toContain(
      SDF_TESTNET_ANCHOR_DOMAIN,
    );
    expect(result.endpoints.transferServerSep6).toContain(
      SDF_TESTNET_ANCHOR_DOMAIN,
    );
    expect(result.endpoints.transferServerSep24).toContain(
      SDF_TESTNET_ANCHOR_DOMAIN,
    );
    expect(result.endpoints.anchorQuoteServer).toContain(
      SDF_TESTNET_ANCHOR_DOMAIN,
    );
    expect(result.endpoints.signingKey).toMatch(/^G[A-Z0-9]{55}$/);
  });

  it("fails cleanly for a domain with no stellar.toml", async () => {
    const result = await checkSep1("example.com");

    expect(result.outcome.sepType).toBe("sep1");
    expect(result.outcome.passed).toBe(false);
    expect(result.outcome.errorDetail).not.toBeNull();
    expect(result.endpoints.webAuthEndpoint).toBeNull();
  });
});
