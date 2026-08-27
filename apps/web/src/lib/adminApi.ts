import "server-only";
import type { IronSession } from "iron-session";
import type { SessionData } from "./session";

const API_URL = process.env.API_URL ?? "http://localhost:4000";
const INTERNAL_API_SECRET = process.env.INTERNAL_API_SECRET;

if (!INTERNAL_API_SECRET) {
  throw new Error("INTERNAL_API_SECRET must be set");
}

export interface AdminApiResult<T> {
  ok: boolean;
  status: number;
  data: T | null;
  error: string | null;
}

/**
 * Calls an /api/v1/admin/* route with the shared internal secret and
 * authenticated admin user context. The session's user ID and role are forwarded
 * via headers so the API can scope the response to this user.
 * Never call this from a Client Component.
 */
export async function adminFetch<T>(
  path: string,
  session: IronSession<SessionData>,
  init?: RequestInit,
): Promise<AdminApiResult<T>> {
  try {
    const res = await fetch(`${API_URL}${path}`, {
      ...init,
      headers: {
        "content-type": "application/json",
        "x-internal-secret": INTERNAL_API_SECRET as string,
        "x-user-id": session.userId || "",
        "x-user-role": session.role || "admin",
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
    console.error(`[adminApi] ${path} failed:`, error);
    return { ok: false, status: 0, data: null, error: "could not reach the server" };
  }
}
