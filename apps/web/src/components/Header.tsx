import Link from "next/link";
import { getSession } from "@/lib/session";
import { logoutAction } from "@/app/actions/auth";

const NAV_LINKS = [
  { href: "/directory", label: "Directory" },
  { href: "/how-it-works", label: "How it works" },
  { href: "/pricing", label: "Pricing" },
  { href: "/docs", label: "Docs" },
];

export async function Header() {
  const session = await getSession();
  const isSignedIn = Boolean(session.userId);

  return (
    <header className="border-b border-slate-800">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-400" />
          <span className="text-base font-semibold tracking-tight text-slate-100">
            SEPGATE
          </span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm text-slate-400 sm:flex">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="transition hover:text-slate-100">
              {link.label}
            </Link>
          ))}
        </nav>
        {isSignedIn ? (
          <div className="flex items-center gap-3 text-sm">
            <Link
              href={session.role === "admin" ? "/admin" : "/app"}
              className="text-slate-400 transition hover:text-slate-100"
            >
              Dashboard
            </Link>
            <form action={logoutAction}>
              <button
                type="submit"
                className="rounded-md border border-slate-700 px-3 py-1.5 font-medium text-slate-300 transition hover:border-slate-600"
              >
                Sign out
              </button>
            </form>
          </div>
        ) : (
          <div className="flex items-center gap-3 text-sm">
            <Link href="/login" className="text-slate-400 transition hover:text-slate-100">
              Sign in
            </Link>
            <Link
              href="/signup"
              className="rounded-md bg-slate-100 px-3 py-1.5 font-medium text-slate-950 transition hover:bg-white"
            >
              Claim your anchor
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
