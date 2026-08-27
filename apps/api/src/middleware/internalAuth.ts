import type { Request, Response, NextFunction } from "express";

/**
 * Gates the /api/v1/operator/* routes, which return data scoped to a
 * specific user. Only apps/web's server (never a browser) calls these,
 * authenticated with a shared secret set on both deployments — the actual
 * human authentication already happened via apps/web's own session cookie
 * before it made this server-to-server call.
 */
export function requireInternalSecret(req: Request, res: Response, next: NextFunction): void {
  const expected = process.env.INTERNAL_API_SECRET;
  if (!expected) {
    console.error("[internalAuth] INTERNAL_API_SECRET is not configured");
    res.status(500).json({ error: "server misconfigured" });
    return;
  }
  if (req.header("x-internal-secret") !== expected) {
    res.status(401).json({ error: "unauthorized" });
    return;
  }
  next();
}
