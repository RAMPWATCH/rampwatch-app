import { Keypair, WebAuth } from "@stellar/stellar-sdk";
import { fetchJson, type FetchTextOptions } from "./http";
import type { SepCheckOutcome, StellarTomlEndpoints } from "./types";

interface ChallengeResponse {
  transaction?: unknown;
  network_passphrase?: unknown;
}

function fail(latencyMs: number, errorDetail: string): SepCheckOutcome {
  return {
    sepType: "sep10",
    passed: false,
    latencyMs,
    errorDetail,
    rawResponse: null,
  };
}

/**
 * SEP-10: requests a web-auth challenge from the anchor and verifies it was
 * correctly built and signed by the anchor's SIGNING_KEY. This never signs
 * or submits anything — the probe keypair is used only to request a
 * challenge; verification is read-only via stellar-sdk's WebAuth.readChallengeTx.
 */
export async function checkSep10(
  domain: string,
  endpoints: StellarTomlEndpoints,
  networkPassphrase: string,
  options?: FetchTextOptions,
): Promise<SepCheckOutcome> {
  if (!endpoints.webAuthEndpoint) {
    return fail(0, "stellar.toml is missing WEB_AUTH_ENDPOINT");
  }
  if (!endpoints.signingKey) {
    return fail(0, "stellar.toml is missing SIGNING_KEY");
  }

  let url: URL;
  try {
    url = new URL(endpoints.webAuthEndpoint);
  } catch {
    return fail(0, `WEB_AUTH_ENDPOINT is not a valid URL: ${endpoints.webAuthEndpoint}`);
  }

  // Ephemeral probe keypair — used only to populate the "account" query
  // param SEP-10 requires. Never funded, never used to sign or submit.
  const probeKeypair = Keypair.random();
  url.searchParams.set("account", probeKeypair.publicKey());
  url.searchParams.set("home_domain", domain);

  const fetched = await fetchJson<ChallengeResponse>(url.toString(), options);
  if (!fetched.ok) {
    return fail(fetched.latencyMs, fetched.errorDetail);
  }

  const challengeTx = fetched.json.transaction;
  if (typeof challengeTx !== "string") {
    return {
      sepType: "sep10",
      passed: false,
      latencyMs: fetched.latencyMs,
      errorDetail: "challenge response is missing a 'transaction' field",
      rawResponse: fetched.json,
    };
  }

  const webAuthDomain = url.host;

  try {
    const { clientAccountID, matchedHomeDomain, memo } = WebAuth.readChallengeTx(
      challengeTx,
      endpoints.signingKey,
      networkPassphrase,
      domain,
      webAuthDomain,
    );
    return {
      sepType: "sep10",
      passed: true,
      latencyMs: fetched.latencyMs,
      errorDetail: null,
      rawResponse: { clientAccountID, matchedHomeDomain, memo },
    };
  } catch (error) {
    return {
      sepType: "sep10",
      passed: false,
      latencyMs: fetched.latencyMs,
      errorDetail: error instanceof Error ? error.message : String(error),
      rawResponse: null,
    };
  }
}
