import type { Metadata } from "next";
import Link from "next/link";
import { getAnchors, type AnchorSummary, type CheckStatus } from "@/lib/api";
import { StatusBadge } from "@/components/StatusBadge";

export const metadata: Metadata = {
  title: "Directory — RampWatch",
};

interface DirectorySearchParams {
  status?: string;
  network?: string;
  claimed?: string;
  asset?: string;
}

function applyFilters(
  anchors: AnchorSummary[],
  filters: DirectorySearchParams,
): AnchorSummary[] {
  return anchors.filter((anchor) => {
    if (filters.status && anchor.status !== filters.status) return false;
    if (filters.network && anchor.network !== filters.network) return false;
    if (filters.claimed === "claimed" && anchor.claimStatus !== "claimed") return false;
    if (filters.claimed === "unclaimed" && anchor.claimStatus === "claimed") return false;
    if (filters.asset && !anchor.assets.includes(filters.asset)) return false;
    return true;
  });
}

const STATUS_OPTIONS: { value: CheckStatus; label: string }[] = [
  { value: "operational", label: "Operational" },
  { value: "degraded", label: "Degraded" },
  { value: "down", label: "Down" },
];

function FilterSelect({
  name,
  label,
  value,
  options,
}: {
  name: string;
  label: string;
  value: string;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="flex flex-col gap-1 text-xs text-slate-500">
      {label}
      <select
        name={name}
        defaultValue={value}
        className="rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-200 focus:border-emerald-500 focus:outline-none"
      >
        <option value="">All</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export default async function DirectoryPage({
  searchParams,
}: {
  searchParams: Promise<DirectorySearchParams>;
}) {
  const filters = await searchParams;
  const anchors = (await getAnchors()) ?? [];
  const filtered = applyFilters(anchors, filters);

  const assetOptions = Array.from(new Set(anchors.flatMap((anchor) => anchor.assets))).sort();

  return (
    <main className="mx-auto max-w-6xl px-6 py-16">
      <p className="text-sm font-medium text-emerald-400">Directory</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-50">
        Every anchor RampWatch monitors
      </h1>
      <p className="mt-3 max-w-2xl text-slate-400">
        Cached from the most recent scheduled check — always free to browse.
        Need a live result instead?{" "}
        <Link href="/verify" className="text-slate-300 underline underline-offset-2">
          Run one on demand
        </Link>
        .
      </p>

      <form className="mt-8 flex flex-wrap gap-4 rounded-lg border border-slate-800 bg-slate-900/30 p-4">
        <FilterSelect
          name="status"
          label="Status"
          value={filters.status ?? ""}
          options={STATUS_OPTIONS}
        />
        <FilterSelect
          name="network"
          label="Network"
          value={filters.network ?? ""}
          options={[
            { value: "mainnet", label: "Mainnet" },
            { value: "testnet", label: "Testnet" },
          ]}
        />
        <FilterSelect
          name="claimed"
          label="Ownership"
          value={filters.claimed ?? ""}
          options={[
            { value: "claimed", label: "Claimed" },
            { value: "unclaimed", label: "Unclaimed" },
          ]}
        />
        <FilterSelect
          name="asset"
          label="Asset"
          value={filters.asset ?? ""}
          options={assetOptions.map((asset) => ({ value: asset, label: asset }))}
        />
        <div className="flex items-end gap-2">
          <button
            type="submit"
            className="rounded-md bg-slate-100 px-4 py-2 text-sm font-medium text-slate-950 transition hover:bg-white"
          >
            Apply
          </button>
          <Link
            href="/directory"
            className="rounded-md border border-slate-700 px-4 py-2 text-sm text-slate-300 transition hover:border-slate-600"
          >
            Clear
          </Link>
        </div>
      </form>

      {filtered.length === 0 ? (
        <p className="mt-16 text-center text-sm text-slate-500">
          No anchors match those filters.
        </p>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((anchor) => (
              <Link
                key={anchor.slug}
                href={`/directory/${anchor.slug}`}
                className="block rounded-lg border border-slate-800 bg-slate-900/30 p-5 transition hover:border-slate-700"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-100">
                      {anchor.displayName ?? anchor.domain}
                    </p>
                    <p className="mt-1 truncate text-xs text-slate-500">{anchor.domain}</p>
                  </div>
                  <span className="shrink-0 rounded-full border border-slate-700 px-2 py-0.5 text-[10px] uppercase tracking-wide text-slate-500">
                    {anchor.network}
                  </span>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <StatusBadge status={anchor.status} />
                  {anchor.claimStatus === "claimed" && (
                    <span className="text-xs text-slate-500">Claimed</span>
                  )}
                </div>
                {anchor.assets.length > 0 && (
                  <p className="mt-3 truncate text-xs text-slate-600">
                    {anchor.assets.slice(0, 5).join(" · ")}
                  </p>
                )}
              </Link>
            ))}
        </div>
      )}
    </main>
  );
}
