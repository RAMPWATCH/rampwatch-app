import type { Request, Response, NextFunction } from "express";

declare global {
  namespace Express {
    interface Request {
      operatorUserId?: string;
      operatorRole?: "operator" | "admin";
    }
  }
}

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

/**
 * Requires an authenticated operator context (user ID).
 * Must run after requireInternalSecret.
 * Attaches operatorUserId and operatorRole to req.
 */
export function requireOperatorContext(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const userId = req.header("x-user-id");
  if (!userId) {
    res.status(401).json({ error: "missing operator context (x-user-id)" });
    return;
  }
  const role = (req.header("x-user-role") || "operator") as "operator" | "admin";
  req.operatorUserId = userId;
  req.operatorRole = role;
  next();
}

/**
 * Requires an admin operator context.
 * Must run after requireInternalSecret and requireOperatorContext.
 */
export function requireAdminContext(req: Request, res: Response, next: NextFunction): void {
  if (req.operatorRole !== "admin") {
    res.status(403).json({ error: "admin access required" });
    return;
  }
  next();
}
