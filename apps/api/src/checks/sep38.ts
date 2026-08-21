import { fetchJson, type FetchTextOptions } from "./http";
import type { SepCheckOutcome, StellarTomlEndpoints } from "./types";

interface Sep38Asset {
  asset?: unknown;
}

interface Sep38InfoResponse {
  assets?: Sep38Asset[];
}

interface Sep38PricesResponse {
  buy_assets?: { asset?: unknown; price?: unknown; decimals?: unknown }[];
}

function fail(latencyMs: number, errorDetail: string, rawResponse: unknown = null): SepCheckOutcome {
  return { sepType: "sep38", passed: false, latencyMs, errorDetail, rawResponse };
}

// SEP-38 requires SEP-10 auth on /prices, /price and /quote, which this
// monitor deliberately never completes (no signing/submitting). A 401/403
// here means the anchor is correctly enforcing auth, not that it's broken.
function isAuthGated(status: number): boolean {
  return status === 401 || status === 403;
}

/**
 * SEP-38: fetches {ANCHOR_QUOTE_SERVER}/info, validates the asset list, and
 * — when the anchor allows it without SEP-10 auth — fetches an indicative
 * price to validate the /prices response shape and measure latency.
 */
export async function checkSep38(
  endpoints: StellarTomlEndpoints,
  options?: FetchTextOptions,
): Promise<SepCheckOutcome> {
  if (!endpoints.anchorQuoteServer) {
    return fail(0, "stellar.toml is missing ANCHOR_QUOTE_SERVER");
  }

  const base = endpoints.anchorQuoteServer.replace(/\/$/, "");
  const infoFetched = await fetchJson<Sep38InfoResponse>(`${base}/info`, options);
  if (!infoFetched.ok) {
    return fail(infoFetched.latencyMs, infoFetched.errorDetail);
  }

  const assets = infoFetched.json.assets;
  if (!Array.isArray(assets) || assets.length === 0) {
    return fail(
      infoFetched.latencyMs,
      "/info response has no 'assets' array",
      infoFetched.json,
    );
  }
  const assetCodes = assets
    .map((entry) => entry.asset)
    .filter((asset): asset is string => typeof asset === "string");
  if (assetCodes.length === 0) {
    return fail(
      infoFetched.latencyMs,
      "/info assets entries are missing an 'asset' field",
      infoFetched.json,
    );
  }

  if (assetCodes.length < 2) {
    return {
      sepType: "sep38",
      passed: true,
      latencyMs: infoFetched.latencyMs,
      errorDetail: null,
      rawResponse: { assets: assetCodes, pricesChecked: false, reason: "fewer than 2 assets — no pair to price" },
    };
  }

  const sellAsset = assetCodes[0] as string;
  const pricesUrl = `${base}/prices?sell_asset=${encodeURIComponent(sellAsset)}&sell_amount=100`;
  const pricesFetched = await fetchJson<Sep38PricesResponse>(pricesUrl, options);
  const totalLatencyMs = infoFetched.latencyMs + pricesFetched.latencyMs;

  if (!pricesFetched.ok) {
    return fail(totalLatencyMs, pricesFetched.errorDetail, { assets: assetCodes });
  }

  if (isAuthGated(pricesFetched.status)) {
    return {
      sepType: "sep38",
      passed: true,
      latencyMs: totalLatencyMs,
      errorDetail: null,
      rawResponse: {
        assets: assetCodes,
        pricesChecked: false,
        reason: `/prices requires SEP-10 auth (HTTP ${pricesFetched.status}), which this monitor does not complete`,
      },
    };
  }

  const buyAssets = pricesFetched.json.buy_assets;
  if (!Array.isArray(buyAssets)) {
    return fail(
      totalLatencyMs,
      "/prices response has no 'buy_assets' array",
      pricesFetched.json,
    );
  }

  return {
    sepType: "sep38",
    passed: true,
    latencyMs: totalLatencyMs,
    errorDetail: null,
    rawResponse: {
      assets: assetCodes,
      pricesChecked: true,
      sellAsset,
      buyAssetCount: buyAssets.length,
    },
  };
}
