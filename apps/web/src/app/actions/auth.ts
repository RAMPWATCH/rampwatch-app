"use server";

import { redirect } from "next/navigation";
import { getSession, type UserRole } from "@/lib/session";

const API_URL = process.env.API_URL ?? "http://localhost:4000";

interface AuthApiResponse {
  user?: { id: string; email: string; role: UserRole };
  error?: string;
}

async function callAuthEndpoint(
  path: string,
  email: string,
  password: string,
): Promise<AuthApiResponse> {
  try {
    const res = await fetch(`${API_URL}${path}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, password }),
      cache: "no-store",
    });
    return (await res.json()) as AuthApiResponse;
  } catch (error) {
    console.error(`[auth] ${path} failed:`, error);
    return { error: "Could not reach the server. Please try again." };
  }
}

export async function signupAction(formData: FormData): Promise<void> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  const result = await callAuthEndpoint("/api/v1/auth/signup", email, password);
  if (!result.user) {
    redirect(`/signup?error=${encodeURIComponent(result.error ?? "Sign up failed")}`);
  }

  const session = await getSession();
  session.userId = result.user.id;
  session.email = result.user.email;
  session.role = result.user.role;
  await session.save();

  redirect("/app");
}

export async function loginAction(formData: FormData): Promise<void> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  const result = await callAuthEndpoint("/api/v1/auth/login", email, password);
  if (!result.user) {
    redirect(`/login?error=${encodeURIComponent(result.error ?? "Login failed")}`);
  }

  const session = await getSession();
  session.userId = result.user.id;
  session.email = result.user.email;
  session.role = result.user.role;
  await session.save();

  redirect(result.user.role === "admin" ? "/admin" : "/app");
}

export async function logoutAction(): Promise<void> {
  const session = await getSession();
  session.destroy();
  redirect("/");
}
