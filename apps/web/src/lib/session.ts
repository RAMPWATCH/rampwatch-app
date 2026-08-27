import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getIronSession, type IronSession, type SessionOptions } from "iron-session";

export type UserRole = "operator" | "admin";

export interface SessionData {
  userId?: string;
  email?: string;
  role?: UserRole;
}

const sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret || sessionSecret.length < 32) {
  throw new Error(
    "SESSION_SECRET must be set to a random string of at least 32 characters",
  );
}

export const sessionOptions: SessionOptions = {
  password: sessionSecret,
  cookieName: "rampwatch_session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  },
};

export async function getSession(): Promise<IronSession<SessionData>> {
  const cookieStore = await cookies();
  // @ts-expect-error iron-session types don't match Next.js 15 ReadonlyRequestCookies, but it works at runtime
  return getIronSession<SessionData>(cookieStore, sessionOptions);
}

export type AuthenticatedSession = IronSession<SessionData> & {
  userId: string;
  email: string;
  role: UserRole;
};

/** For use at the top of a protected page/layout — redirects to /login if not signed in. */
export async function requireSession(): Promise<AuthenticatedSession> {
  const session = await getSession();
  if (!session.userId || !session.email || !session.role) {
    redirect("/login");
  }
  return session as AuthenticatedSession;
}

/** For use at the top of an admin-only page/layout. */
export async function requireAdminSession(): Promise<AuthenticatedSession> {
  const session = await requireSession();
  if (session.role !== "admin") {
    redirect("/app");
  }
  return session;
}
