import type { SepType } from "../db/schema/sepCheckResults";

export interface SepCheckOutcome {
  sepType: SepType;
  passed: boolean;
  latencyMs: number;
  errorDetail: string | null;
  rawResponse: unknown;
}

/** Endpoint URLs extracted from a stellar.toml, consumed by the other checkers. */
export interface StellarTomlEndpoints {
  webAuthEndpoint: string | null;
  transferServerSep6: string | null;
  transferServerSep24: string | null;
  anchorQuoteServer: string | null;
  kycServer: string | null;
  signingKey: string | null;
  networkPassphrase: string | null;
}

export interface Sep1CheckResult {
  outcome: SepCheckOutcome;
  endpoints: StellarTomlEndpoints;
}
