import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { BitcoinSnapshot } from "@/lib/bitcoin";
import {
  formatBtc,
  formatDate,
  formatDifficulty,
  formatNumber,
  formatPct,
  formatUsd,
  formatUsdCompact,
} from "@/lib/format";
import { cn } from "@/lib/utils";

export function StatGrid({ snapshot }: { snapshot: BitcoinSnapshot | null }) {
  return (
    <section id="network" className="scroll-mt-24 space-y-4">
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted">Network</p>
        <h2 className="mt-1 font-display text-2xl text-fg">Six live Bitcoin stats</h2>
        <p className="mt-1 text-sm text-muted">
          Same metrics Clark Moody tracks — price, issuance, cap, ATH, nodes, difficulty.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <PriceCard snapshot={snapshot} />
        <SupplyCard snapshot={snapshot} />
        <MarketCapCard snapshot={snapshot} />
        <AthCard snapshot={snapshot} />
        <NodesCard snapshot={snapshot} />
        <DifficultyCard snapshot={snapshot} />
      </div>
    </section>
  );
}

function PriceCard({ snapshot }: { snapshot: BitcoinSnapshot | null }) {
  const up = (snapshot?.change24hPct ?? 0) >= 0;
  return (
    <Card className="bg-surface/90">
      <CardHeader>
        <CardTitle>1 · Current price</CardTitle>
      </CardHeader>
      <CardContent>
        {snapshot ? (
          <>
            <p className="font-mono text-3xl tabular-nums text-fg">{formatUsd(snapshot.price, 0)}</p>
            <p className={cn("mt-2 font-mono text-sm tabular-nums", up ? "text-up" : "text-down")}>
              {formatPct(snapshot.change24hPct)} · 24h
            </p>
            <p className="mt-4 text-sm text-muted">
              {formatNumber(snapshot.satsPerDollar, 0)} sats per dollar
            </p>
          </>
        ) : (
          <Skeleton className="h-20 w-40" />
        )}
      </CardContent>
    </Card>
  );
}

function SupplyCard({ snapshot }: { snapshot: BitcoinSnapshot | null }) {
  const data = snapshot
    ? [
        { name: "Issued", value: snapshot.circulating, fill: "var(--color-accent)" },
        { name: "Remaining", value: snapshot.remaining, fill: "var(--color-border)" },
      ]
    : [];

  return (
    <Card className="overflow-hidden bg-surface/90">
      <CardHeader>
        <CardTitle>2 · Supply in circulation</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-[1fr_7rem] items-center gap-3">
        {snapshot ? (
          <>
            <div>
              <p className="font-mono text-2xl tabular-nums text-fg">
                {formatNumber(snapshot.circulating, 0)}
              </p>
              <p className="mt-1 text-sm text-muted">
                {snapshot.issuedPct.toFixed(2)}% of 21M issued
              </p>
              <p className="mt-3 text-sm text-muted">
                Remaining {formatBtc(snapshot.remaining, 0)}
              </p>
            </div>
            <div className="h-28 overflow-hidden">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    dataKey="value"
                    innerRadius={28}
                    outerRadius={46}
                    stroke="none"
                    isAnimationActive={false}
                  >
                    {data.map((entry) => (
                      <Cell key={entry.name} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => formatBtc(Number(value), 0)}
                    contentStyle={{
                      background: "var(--color-surface-2)",
                      border: "1px solid var(--color-border)",
                      borderRadius: 8,
                      color: "var(--color-fg)",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </>
        ) : (
          <Skeleton className="col-span-2 h-24" />
        )}
      </CardContent>
    </Card>
  );
}

function MarketCapCard({ snapshot }: { snapshot: BitcoinSnapshot | null }) {
  return (
    <Card className="bg-surface/90">
      <CardHeader>
        <CardTitle>3 · Market cap</CardTitle>
      </CardHeader>
      <CardContent>
        {snapshot ? (
          <>
            <p className="font-mono text-3xl tabular-nums text-fg">
              {formatUsdCompact(snapshot.marketCap)}
            </p>
            <p className="mt-2 font-mono text-sm tabular-nums text-muted">
              {formatUsd(snapshot.marketCap, 0)}
            </p>
            <p className="mt-4 text-sm text-muted">Spot × circulating supply</p>
          </>
        ) : (
          <Skeleton className="h-20 w-40" />
        )}
      </CardContent>
    </Card>
  );
}

function AthCard({ snapshot }: { snapshot: BitcoinSnapshot | null }) {
  return (
    <Card className="bg-surface/90">
      <CardHeader>
        <CardTitle>4 · All-time high</CardTitle>
      </CardHeader>
      <CardContent>
        {snapshot ? (
          <>
            <p className="font-mono text-3xl tabular-nums text-fg">
              {formatUsd(snapshot.athPrice, 0)}
            </p>
            <p className="mt-2 text-sm text-muted">{formatDate(snapshot.athDate)}</p>
            <p
              className={cn(
                "mt-4 font-mono text-sm tabular-nums",
                snapshot.athDrawdownPct < 0 ? "text-down" : "text-up",
              )}
            >
              {formatPct(snapshot.athDrawdownPct)} from ATH
            </p>
          </>
        ) : (
          <Skeleton className="h-20 w-40" />
        )}
      </CardContent>
    </Card>
  );
}

function NodesCard({ snapshot }: { snapshot: BitcoinSnapshot | null }) {
  const rows = snapshot
    ? [
        { name: "Core", value: snapshot.nodes.core, bar: "bg-accent" },
        { name: "Knots", value: snapshot.nodes.knots, bar: "bg-coin" },
        { name: "RDTS", value: snapshot.nodes.rdts, bar: "bg-tab" },
      ]
    : [];
  const max = Math.max(1, ...rows.map((row) => row.value));

  return (
    <Card className="bg-surface/90">
      <CardHeader>
        <CardTitle>5 · Reachable nodes</CardTitle>
      </CardHeader>
      <CardContent>
        {snapshot ? (
          <>
            <p className="font-mono text-3xl tabular-nums text-fg">
              {formatNumber(snapshot.nodes.total)}
            </p>
            <p className="mt-1 text-sm text-muted">Core · Knots · RDTS (BIP-110)</p>
            <ul className="mt-4 space-y-3">
              {rows.map((row) => (
                <li key={row.name}>
                  <div className="flex items-baseline justify-between gap-3 text-xs">
                    <span className="text-muted">{row.name}</span>
                    <span className="font-mono tabular-nums text-fg">{formatNumber(row.value)}</span>
                  </div>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-surface-2">
                    <div
                      className={cn("h-full rounded-full", row.bar)}
                      style={{ width: `${Math.max(4, (row.value / max) * 100)}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-subtle">
              RDTS counts BIP-110 signaling nodes.
            </p>
          </>
        ) : (
          <Skeleton className="h-32 w-full" />
        )}
      </CardContent>
    </Card>
  );
}

function DifficultyCard({ snapshot }: { snapshot: BitcoinSnapshot | null }) {
  return (
    <Card className="bg-surface/90">
      <CardHeader>
        <CardTitle>6 · Network difficulty</CardTitle>
      </CardHeader>
      <CardContent>
        {snapshot ? (
          <>
            <p className="font-mono text-3xl tabular-nums text-fg">
              {formatDifficulty(snapshot.difficulty)}
            </p>
            <p className="mt-2 font-mono text-xs tabular-nums text-muted">
              {formatNumber(snapshot.difficulty, 0)}
            </p>
            <p className="mt-4 text-sm text-muted">
              Height {formatNumber(snapshot.blockHeight)}
            </p>
          </>
        ) : (
          <Skeleton className="h-20 w-40" />
        )}
      </CardContent>
    </Card>
  );
}
