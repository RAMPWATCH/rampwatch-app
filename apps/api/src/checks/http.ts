import dns from "node:dns";

// Node's fetch (undici) can reject outright when a host's IPv6 route is
// unreachable instead of falling back to IPv4, which makes checks against
// otherwise-healthy anchors fail. Prefer IPv4 resolution for all outbound
// checker requests.
dns.setDefaultResultOrder("ipv4first");

export interface FetchTextSuccess {
  ok: true;
  status: number;
  text: string;
  latencyMs: number;
}

export interface FetchTextFailure {
  ok: false;
  errorDetail: string;
  latencyMs: number;
}

export type FetchTextResult = FetchTextSuccess | FetchTextFailure;

export interface FetchTextOptions {
  timeoutMs?: number;
  retries?: number;
  headers?: Record<string, string>;
}

const DEFAULT_TIMEOUT_MS = 8_000;
const DEFAULT_RETRIES = 2;
const RETRY_BACKOFF_MS = 500;

function describeFetchError(error: unknown, timeoutMs: number): string {
  if (!(error instanceof Error)) {
    return String(error);
  }
  if (error.name === "AbortError") {
    return `timed out after ${timeoutMs}ms`;
  }

  const cause = (error as { cause?: unknown }).cause;
  if (cause instanceof AggregateError) {
    const nested = cause.errors
      .map((inner) => (inner instanceof Error ? inner.message : String(inner)))
      .join("; ");
    return `${error.message}: ${nested}`;
  }
  if (cause instanceof Error) {
    return `${error.message}: ${cause.message}`;
  }
  return error.message;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Fetches a URL as text with a hard timeout and bounded retries. Never
 * throws — every network/parsing failure is surfaced as a typed result so
 * callers (SEP checkers) can always produce a check_run row instead of
 * crashing the scheduler or an x402-paid request mid-flight.
 */
export async function fetchText(
  url: string,
  options: FetchTextOptions = {},
): Promise<FetchTextResult> {
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const retries = options.retries ?? DEFAULT_RETRIES;
  const startedAt = Date.now();

  let lastError = "unknown error";

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: { accept: "*/*", ...options.headers },
      });
      const text = await response.text();
      clearTimeout(timer);

      if (!response.ok) {
        lastError = `HTTP ${response.status} ${response.statusText}`;
      } else {
        return {
          ok: true,
          status: response.status,
          text,
          latencyMs: Date.now() - startedAt,
        };
      }
    } catch (error) {
      clearTimeout(timer);
      lastError = describeFetchError(error, timeoutMs);
    }

    if (attempt < retries) {
      await sleep(RETRY_BACKOFF_MS * (attempt + 1));
    }
  }

  return {
    ok: false,
    errorDetail: lastError,
    latencyMs: Date.now() - startedAt,
  };
}

/**
 * Fetches JSON as text, then parses it, keeping the same never-throw
 * contract as fetchText.
 */
export interface FetchJsonSuccess<T> {
  ok: true;
  status: number;
  json: T;
  latencyMs: number;
}

export type FetchJsonResult<T> = FetchJsonSuccess<T> | FetchTextFailure;

export async function fetchJson<T = unknown>(
  url: string,
  options: FetchTextOptions = {},
): Promise<FetchJsonResult<T>> {
  const result = await fetchText(url, options);
  if (!result.ok) {
    return result;
  }

  try {
    const json = JSON.parse(result.text) as T;
    return {
      ok: true,
      status: result.status,
      json,
      latencyMs: result.latencyMs,
    };
  } catch (error) {
    return {
      ok: false,
      errorDetail: `invalid JSON: ${error instanceof Error ? error.message : String(error)}`,
      latencyMs: result.latencyMs,
    };
  }
}
