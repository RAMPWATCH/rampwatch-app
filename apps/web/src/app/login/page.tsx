import type { Metadata } from "next";
import Link from "next/link";
import { loginAction } from "@/app/actions/auth";

export const metadata: Metadata = { title: "Sign in — SEPGATE" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <main className="mx-auto max-w-sm px-6 py-20">
      <h1 className="text-2xl font-semibold tracking-tight text-slate-50">
        Sign in
      </h1>

      {error && (
        <p className="mt-4 rounded-md border border-rose-500/30 bg-status-down/10 px-3 py-2 text-sm text-rose-300">
          {error}
        </p>
      )}

      <form action={loginAction} className="mt-6 space-y-4">
        <div>
          <label htmlFor="email" className="text-sm text-text-secondary">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="mt-1 w-full rounded-md border border-border-subtle bg-bg-secondary px-3 py-2 text-sm text-text-primary focus:border-emerald-500 focus:outline-none"
          />
        </div>
        <div>
          <label htmlFor="password" className="text-sm text-text-secondary">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            className="mt-1 w-full rounded-md border border-border-subtle bg-bg-secondary px-3 py-2 text-sm text-text-primary focus:border-emerald-500 focus:outline-none"
          />
        </div>
        <button
          type="submit"
          className="w-full rounded-md bg-status-operational px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-status-operational"
        >
          Sign in
        </button>
      </form>

      <p className="mt-6 text-sm text-text-secondary">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="text-text-primary underline underline-offset-2">
          Create one
        </Link>
      </p>
    </main>
  );
}
