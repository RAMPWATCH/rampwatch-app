import { fetchJson, probeStatus, type FetchTextOptions } from "./http";
import type { SepCheckOutcome, StellarTomlEndpoints } from "./types";

interface Sep24InfoResponse {
  deposit?: Record<string, { enabled?: boolean }>;
  withdraw?: Record<string, { enabled?: boolean }>;
}

function fail(latencyMs: number, errorDetail: string, rawResponse: unknown = null): SepCheckOutcome {
  return { sepType: "sep24", passed: false, latencyMs, errorDetail, rawResponse };
}

function enabledAssets(section?: Record<string, { enabled?: boolean }>): string[] {
  if (!section) return [];
  return Object.entries(section)
    .filter(([, config]) => config?.enabled === true)
    .map(([assetCode]) => assetCode);
}

// An unauthenticated interactive request must be rejected, not accepted —
// any 4xx confirms the endpoint exists and enforces auth; 2xx/3xx/5xx/no
// response are all treated as a broken or unreachable interactive flow.
function isExpectedAuthRejection(status: number): boolean {
  return status >= 400 && status < 500;
}

/**
 * SEP-24: fetches {TRANSFER_SERVER_SEP0024}/info, validates the
 * deposit/withdraw schema, and probes the interactive deposit endpoint for
 * reachability (expects it to reject an unauthenticated request, since we
 * never complete a real SEP-10 auth flow here).
 */
export async function checkSep24(
  endpoints: StellarTomlEndpoints,
  options?: FetchTextOptions,
): Promise<SepCheckOutcome> {
  if (!endpoints.transferServerSep24) {
    return fail(0, "stellar.toml is missing TRANSFER_SERVER_SEP0024");
  }

  const base = endpoints.transferServerSep24.replace(/\/$/, "");
  const infoFetched = await fetchJson<Sep24InfoResponse>(`${base}/info`, options);
  if (!infoFetched.ok) {
    return fail(infoFetched.latencyMs, infoFetched.errorDetail);
  }

  const { deposit, withdraw } = infoFetched.json;
  if (typeof deposit !== "object" || deposit === null) {
    return fail(
      infoFetched.latencyMs,
      "/info response is missing a 'deposit' object",
      infoFetched.json,
    );
  }
  if (typeof withdraw !== "object" || withdraw === null) {
    return fail(
      infoFetched.latencyMs,
      "/info response is missing a 'withdraw' object",
      infoFetched.json,
    );
  }

  const probe = await probeStatus(`${base}/transactions/deposit/interactive`, {
    ...options,
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: "asset_code=XLM",
  });

  const totalLatencyMs = infoFetched.latencyMs + probe.latencyMs;

  if (!probe.reached) {
    return fail(
      totalLatencyMs,
      `interactive deposit endpoint unreachable: ${probe.errorDetail}`,
      { depositAssets: enabledAssets(deposit), withdrawAssets: enabledAssets(withdraw) },
    );
  }
  if (!isExpectedAuthRejection(probe.status)) {
    return fail(
      totalLatencyMs,
      `interactive deposit endpoint returned unexpected status ${probe.status} for an unauthenticated request`,
      { depositAssets: enabledAssets(deposit), withdrawAssets: enabledAssets(withdraw) },
    );
  }

  return {
    sepType: "sep24",
    passed: true,
    latencyMs: totalLatencyMs,
    errorDetail: null,
    rawResponse: {
      depositAssets: enabledAssets(deposit),
      withdrawAssets: enabledAssets(withdraw),
      interactiveEndpointStatus: probe.status,
    },
  };
}
