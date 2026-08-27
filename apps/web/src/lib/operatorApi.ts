import "server-only";

const API_URL = process.env.API_URL ?? "http://localhost:4000";
const INTERNAL_API_SECRET = process.env.INTERNAL_API_SECRET;

if (!INTERNAL_API_SECRET) {
  throw new Error("INTERNAL_API_SECRET must be set");
}

export interface OperatorApiResult<T> {
  ok: boolean;
  status: number;
  data: T | null;
  error: string | null;
}

/**
 * Calls an /api/v1/operator/* route with the shared internal secret. These
 * routes trust the caller (this server) to have already authenticated the
 * human via the session cookie — never call this from a Client Component.
 */
export async function operatorFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<OperatorApiResult<T>> {
  try {
    const res = await fetch(`${API_URL}${path}`, {
      ...init,
      headers: {
        "content-type": "application/json",
        "x-internal-secret": INTERNAL_API_SECRET as string,
        ...init?.headers,
      },
      cache: "no-store",
    } as RequestInit & { cache: string });
    const body = (await res.json().catch(() => null)) as
      | (T & { error?: string })
      | { error?: string }
      | null;
    return {
      ok: res.ok,
      status: res.status,
      data: res.ok ? (body as T) : null,
      error: !res.ok ? ((body as { error?: string } | null)?.error ?? "request failed") : null,
    };
  } catch (error) {
    console.error(`[operatorApi] ${path} failed:`, error);
    return { ok: false, status: 0, data: null, error: "could not reach the server" };
  }
}
