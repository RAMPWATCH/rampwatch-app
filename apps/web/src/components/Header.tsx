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
    <header className="border-b border-border-subtle">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-400" />
          <span className="text-base font-semibold tracking-tight text-text-primary">
            SEPGATE
          </span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm text-text-secondary sm:flex">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="transition hover:text-text-primary">
              {link.label}
            </Link>
          ))}
        </nav>
        {isSignedIn ? (
          <div className="flex items-center gap-3 text-sm">
            <Link
              href={session.role === "admin" ? "/admin" : "/app"}
              className="text-text-secondary transition hover:text-text-primary"
            >
              Dashboard
            </Link>
            <form action={logoutAction}>
              <button
                type="submit"
                className="rounded-md border border-border-subtle px-3 py-1.5 font-medium text-text-primary transition hover:border-border-active"
              >
                Sign out
              </button>
            </form>
          </div>
        ) : (
          <div className="flex items-center gap-3 text-sm">
            <Link href="/login" className="text-text-secondary transition hover:text-text-primary">
              Sign in
            </Link>
            <Link
              href="/signup"
              className="rounded-md bg-accent-primary px-3 py-1.5 font-medium text-bg-primary transition hover:bg-white"
            >
              Claim your anchor
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
