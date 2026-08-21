const API_URL = process.env.API_URL ?? "http://localhost:4000";

export type CheckStatus = "operational" | "degraded" | "down";

export interface AnchorSummary {
  slug: string;
  domain: string;
  displayName: string | null;
  network: "mainnet" | "testnet";
  claimStatus: "unclaimed" | "pending" | "claimed";
  status: CheckStatus | null;
  lastCheckedAt: string | null;
  assets: string[];
}

export interface SepResult {
  sepType: string;
  passed: boolean;
  latencyMs: number | null;
  errorDetail: string | null;
}

export interface AnchorDetail {
  slug: string;
  domain: string;
  displayName: string | null;
  network: "mainnet" | "testnet";
  claimStatus: "unclaimed" | "pending" | "claimed";
  uptimeHistory: { checkRunId: string; status: CheckStatus; startedAt: string }[];
  latestSepResults: SepResult[];
}

export interface PublicPricing {
  priceCheck: string;
  priceFullReport: string;
  priceVerifyDomain: string;
  asset: string;
  network: string;
}

export interface Stats {
  anchorsMonitored: number;
}

async function apiGet<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${API_URL}${path}`, {
      // Directory/detail data changes on a scheduler cadence, not per
      // request — a short cache keeps pages fast without going stale for
      // more than a few seconds.
      next: { revalidate: 30 },
    });
    if (!res.ok) {
      console.error(`[api] GET ${path} -> HTTP ${res.status}`);
      return null;
    }
    return (await res.json()) as T;
  } catch (error) {
    console.error(`[api] GET ${path} failed:`, error);
    return null;
  }
}

export function getAnchors(): Promise<AnchorSummary[] | null> {
  return apiGet<{ anchors: AnchorSummary[] }>("/api/v1/anchors").then(
    (data) => data?.anchors ?? null,
  );
}

export function getAnchorDetail(slug: string): Promise<AnchorDetail | null> {
  return apiGet<AnchorDetail>(`/api/v1/anchors/${encodeURIComponent(slug)}`);
}

export function getStats(): Promise<Stats | null> {
  return apiGet<Stats>("/api/v1/stats");
}

export function getPricing(): Promise<PublicPricing | null> {
  return apiGet<PublicPricing>("/api/v1/pricing");
}
