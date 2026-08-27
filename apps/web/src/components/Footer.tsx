import Link from "next/link";

const FOOTER_LINKS: { heading: string; links: { href: string; label: string }[] }[] = [
  {
    heading: "Product",
    links: [
      { href: "/directory", label: "Directory" },
      { href: "/how-it-works", label: "How it works" },
      { href: "/pricing", label: "Pricing" },
      { href: "/docs", label: "API docs" },
    ],
  },
  {
    heading: "Company",
    links: [
      { href: "/about", label: "About" },
      { href: "/security", label: "Security" },
      { href: "/contact", label: "Contact" },
      { href: "/blog", label: "Blog" },
      { href: "/changelog", label: "Changelog" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-border-subtle">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          <div className="col-span-2 sm:col-span-2">
            <p className="text-base font-semibold text-text-primary">SEPGATE</p>
            <p className="mt-2 max-w-xs text-sm text-text-secondary">
              Independent SEP-1/6/10/24/38 compliance monitoring for Stellar
              anchors — free on a schedule, on-demand via x402.
            </p>
          </div>
          {FOOTER_LINKS.map((section) => (
            <div key={section.heading}>
              <p className="text-sm font-medium text-text-primary">{section.heading}</p>
              <ul className="mt-3 space-y-2">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-text-secondary transition hover:text-text-primary"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p className="mt-10 text-xs text-text-tertiary">
          © {new Date().getFullYear()} SEPGATE. Not affiliated with the
          Stellar Development Foundation.
        </p>
      </div>
    </footer>
  );
}
