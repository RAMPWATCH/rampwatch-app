import { parse as parseToml } from "smol-toml";
import { fetchText, type FetchTextOptions } from "./http";
import type { Sep1CheckResult, StellarTomlEndpoints } from "./types";

function asString(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}

function extractEndpoints(parsed: Record<string, unknown>): StellarTomlEndpoints {
  return {
    webAuthEndpoint: asString(parsed.WEB_AUTH_ENDPOINT),
    transferServerSep6: asString(parsed.TRANSFER_SERVER),
    transferServerSep24: asString(parsed.TRANSFER_SERVER_SEP0024),
    anchorQuoteServer: asString(parsed.ANCHOR_QUOTE_SERVER),
    kycServer: asString(parsed.KYC_SERVER),
    signingKey: asString(parsed.SIGNING_KEY),
    networkPassphrase: asString(parsed.NETWORK_PASSPHRASE),
  };
}

const EMPTY_ENDPOINTS: StellarTomlEndpoints = {
  webAuthEndpoint: null,
  transferServerSep6: null,
  transferServerSep24: null,
  anchorQuoteServer: null,
  kycServer: null,
  signingKey: null,
  networkPassphrase: null,
};

/**
 * SEP-1: fetches /.well-known/stellar.toml for a domain, validates it parses
 * as TOML, and extracts the endpoint URLs the other SEP checkers need.
 */
export async function checkSep1(
  domain: string,
  options?: FetchTextOptions,
): Promise<Sep1CheckResult> {
  const url = `https://${domain}/.well-known/stellar.toml`;
  const fetched = await fetchText(url, options);

  if (!fetched.ok) {
    return {
      outcome: {
        sepType: "sep1",
        passed: false,
        latencyMs: fetched.latencyMs,
        errorDetail: fetched.errorDetail,
        rawResponse: null,
      },
      endpoints: EMPTY_ENDPOINTS,
    };
  }

  try {
    const parsed = parseToml(fetched.text) as Record<string, unknown>;
    return {
      outcome: {
        sepType: "sep1",
        passed: true,
        latencyMs: fetched.latencyMs,
        errorDetail: null,
        rawResponse: parsed,
      },
      endpoints: extractEndpoints(parsed),
    };
  } catch (error) {
    return {
      outcome: {
        sepType: "sep1",
        passed: false,
        latencyMs: fetched.latencyMs,
        errorDetail: `invalid TOML: ${error instanceof Error ? error.message : String(error)}`,
        rawResponse: fetched.text.slice(0, 2000),
      },
      endpoints: EMPTY_ENDPOINTS,
    };
  }
}
