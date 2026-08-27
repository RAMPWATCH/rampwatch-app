import type { Metadata } from "next";

export const metadata: Metadata = { title: "Contact — SEPGATE" };

export default function ContactPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-20">
      <p className="text-sm font-medium text-status-operational">Contact</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-50">
        Get in touch
      </h1>
      <div className="mt-8 space-y-6">
        <div>
          <p className="text-sm font-medium text-text-primary">Anchor operators</p>
          <p className="mt-1 text-sm text-text-secondary">
            Think we&apos;ve got something wrong about your anchor, or want
            help claiming your listing?
          </p>
          <a
            href="mailto:operators@sepgate.app"
            className="mt-1 inline-block text-sm text-status-operational hover:text-emerald-300"
          >
            operators@sepgate.app
          </a>
        </div>
        <div>
          <p className="text-sm font-medium text-text-primary">Security reports</p>
          <p className="mt-1 text-sm text-text-secondary">
            Found a vulnerability? Please report it responsibly.
          </p>
          <a
            href="mailto:security@sepgate.app"
            className="mt-1 inline-block text-sm text-status-operational hover:text-emerald-300"
          >
            security@sepgate.app
          </a>
        </div>
        <div>
          <p className="text-sm font-medium text-text-primary">Everything else</p>
          <a
            href="mailto:hello@sepgate.app"
            className="mt-1 inline-block text-sm text-status-operational hover:text-emerald-300"
          >
            hello@sepgate.app
          </a>
        </div>
      </div>
    </main>
  );
}
