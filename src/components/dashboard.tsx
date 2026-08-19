import { useEffect, useState } from "react";
import { AboutPanel } from "@/components/about-panel";
import { InstallPanel } from "@/components/install-panel";
import { MarketSection } from "@/components/market-section";
import { ResourceColumns } from "@/components/resource-columns";
import { SiteHeader } from "@/components/site-header";
import { StatGrid } from "@/components/stat-grid";
import { getBitcoinSnapshot, type BitcoinSnapshot } from "@/lib/bitcoin";

export function Dashboard({ initial }: { initial: BitcoinSnapshot | null }) {
  const [snapshot, setSnapshot] = useState<BitcoinSnapshot | null>(initial);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = () => {
      getBitcoinSnapshot()
        .then((next) => {
          if (cancelled) return;
          setSnapshot(next);
          setError(null);
        })
        .catch((err: unknown) => {
          if (cancelled) return;
          if (!snapshot) {
            setError(err instanceof Error ? err.message : "Unable to load Bitcoin stats");
          }
        });
    };

    const id = window.setInterval(load, 30_000);
    if (!initial) load();
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initial]);

  return (
    <div className="relative min-h-screen text-fg">
      <div
        className="pointer-events-none fixed inset-0 bg-[url('/banner.jpg'),url('/banner.svg')] bg-cover bg-center bg-no-repeat"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none fixed inset-0 bg-[linear-gradient(90deg,var(--color-bg)_0%,color-mix(in_oklab,var(--color-bg)_88%,transparent)_42%,color-mix(in_oklab,var(--color-bg)_55%,transparent)_100%)]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none fixed inset-0 bg-[linear-gradient(180deg,color-mix(in_oklab,var(--color-bg)_35%,transparent)_0%,transparent_28%,color-mix(in_oklab,var(--color-bg)_70%,transparent)_100%)]"
        aria-hidden="true"
      />

      <div className="relative">
        <SiteHeader />
        <main className="mx-auto flex max-w-6xl flex-col gap-12 px-4 py-8 sm:px-6 sm:py-12">
          <AboutPanel />
          {error && !snapshot ? (
            <p className="rounded-lg bg-surface px-4 py-3 text-sm text-down shadow-[var(--shadow-border)]">
              {error}
            </p>
          ) : null}
          <MarketSection snapshot={snapshot} />
          <StatGrid snapshot={snapshot} />
          <InstallPanel />
          <ResourceColumns />
        </main>
        <footer className="relative mx-auto max-w-6xl px-4 py-10 text-xs text-subtle sm:px-6">
          Live figures via Coinbase, Kraken, blockchain.info, Blockstream, and btcnodes.io —
          the same set Clark Moody publishes. Not financial advice.
        </footer>
      </div>
    </div>
  );
}
