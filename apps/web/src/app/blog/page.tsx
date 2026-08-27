import type { Metadata } from "next";

export const metadata: Metadata = { title: "Blog — SEPGATE" };

const POSTS = [
  {
    slug: "launching-rampwatch",
    title: "Launching SEPGATE",
    date: "2026-08-21",
    excerpt:
      "Why we built an independent, always-on SEP compliance monitor for Stellar anchors — and why the on-demand checks are priced per call over x402 instead of behind a subscription.",
  },
];

export default function BlogPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-20">
      <p className="text-sm font-medium text-status-operational">Blog</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-50">
        Notes from SEPGATE
      </h1>
      <div className="mt-10 space-y-8">
        {POSTS.map((post) => (
          <article key={post.slug} className="border-b border-border-subtle pb-8 last:border-b-0">
            <p className="text-xs text-text-tertiary">
              {new Date(post.date).toLocaleDateString(undefined, {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
            <h2 className="mt-1 text-lg font-semibold text-text-primary">{post.title}</h2>
            <p className="mt-2 text-sm text-text-secondary">{post.excerpt}</p>
          </article>
        ))}
      </div>
    </main>
  );
}
