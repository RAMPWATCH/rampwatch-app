import type { Metadata } from "next";
import Link from "next/link";
import { signupAction } from "@/app/actions/auth";

export const metadata: Metadata = { title: "Claim your anchor — SEPGATE" };

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <main className="mx-auto max-w-sm px-6 py-20">
      <h1 className="text-2xl font-semibold tracking-tight text-slate-50">
        Create your account
      </h1>
      <p className="mt-2 text-sm text-text-secondary">
        Free — lets you claim your anchor and configure alerts.
      </p>

      {error && (
        <p className="mt-4 rounded-md border border-rose-500/30 bg-status-down/10 px-3 py-2 text-sm text-rose-300">
          {error}
        </p>
      )}

      <form action={signupAction} className="mt-6 space-y-4">
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
            minLength={8}
            className="mt-1 w-full rounded-md border border-border-subtle bg-bg-secondary px-3 py-2 text-sm text-text-primary focus:border-emerald-500 focus:outline-none"
          />
          <p className="mt-1 text-xs text-text-tertiary">At least 8 characters.</p>
        </div>
        <button
          type="submit"
          className="w-full rounded-md bg-status-operational px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-status-operational"
        >
          Create account
        </button>
      </form>

      <p className="mt-6 text-sm text-text-secondary">
        Already have an account?{" "}
        <Link href="/login" className="text-text-primary underline underline-offset-2">
          Sign in
        </Link>
      </p>
    </main>
  );
}
