import { fetchJson, type FetchTextOptions } from "./http";
import type { SepCheckOutcome, StellarTomlEndpoints } from "./types";

interface Sep6InfoResponse {
  deposit?: Record<string, { enabled?: boolean }>;
  withdraw?: Record<string, { enabled?: boolean }>;
}

function fail(latencyMs: number, errorDetail: string, rawResponse: unknown = null): SepCheckOutcome {
  return { sepType: "sep6", passed: false, latencyMs, errorDetail, rawResponse };
}

function enabledAssets(section?: Record<string, { enabled?: boolean }>): string[] {
  if (!section) return [];
  return Object.entries(section)
    .filter(([, config]) => config?.enabled === true)
    .map(([assetCode]) => assetCode);
}

/**
 * SEP-6: fetches {TRANSFER_SERVER}/info and validates the deposit/withdraw
 * schema the spec requires, and reports which assets are enabled.
 */
export async function checkSep6(
  endpoints: StellarTomlEndpoints,
  options?: FetchTextOptions,
): Promise<SepCheckOutcome> {
  if (!endpoints.transferServerSep6) {
    return fail(0, "stellar.toml is missing TRANSFER_SERVER");
  }

  const infoUrl = `${endpoints.transferServerSep6.replace(/\/$/, "")}/info`;
  const fetched = await fetchJson<Sep6InfoResponse>(infoUrl, options);
  if (!fetched.ok) {
    return fail(fetched.latencyMs, fetched.errorDetail);
  }

  const { deposit, withdraw } = fetched.json;
  if (typeof deposit !== "object" || deposit === null) {
    return fail(
      fetched.latencyMs,
      "/info response is missing a 'deposit' object",
      fetched.json,
    );
  }
  if (typeof withdraw !== "object" || withdraw === null) {
    return fail(
      fetched.latencyMs,
      "/info response is missing a 'withdraw' object",
      fetched.json,
    );
  }

  return {
    sepType: "sep6",
    passed: true,
    latencyMs: fetched.latencyMs,
    errorDetail: null,
    rawResponse: {
      depositAssets: enabledAssets(deposit),
      withdrawAssets: enabledAssets(withdraw),
    },
  };
}
