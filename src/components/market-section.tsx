import { useEffect, useState } from "react";
import { Activity } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { PriceChart } from "@/components/price-chart";
import { getPriceChart, type BitcoinSnapshot, type ChartPoint, type ChartRange } from "@/lib/bitcoin";
import { formatBtc, formatNumber, formatPct, formatTime, formatUsd } from "@/lib/format";
import { cn } from "@/lib/utils";

const RANGES: ChartRange[] = ["1D", "7D", "30D", "90D", "1Y"];

export function MarketSection({ snapshot }: { snapshot: BitcoinSnapshot | null }) {
  const [range, setRange] = useState<ChartRange>("7D");
  const [points, setPoints] = useState<ChartPoint[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getPriceChart({ data: range })
      .then((next) => {
        if (!cancelled) setPoints(next);
      })
      .catch(() => {
        if (!cancelled) setPoints([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [range]);

  const rangePct = changeOverRange(points, snapshot?.price, snapshot?.change24hPct ?? 0);
  const up = rangePct >= 0;

  return (
    <section id="markets" className="scroll-mt-24 space-y-4">
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted">Markets</p>
          <h2 className="mt-1 font-display text-2xl text-fg">Price & live tape</h2>
        </div>
        {snapshot ? (
          <p className="flex items-center gap-2 text-xs text-muted">
            <Activity className="size-3.5 text-accent" />
            {formatTime(snapshot.updatedAt)}
          </p>
        ) : null}
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.7fr)_minmax(16rem,1fr)]">
        <Card className="bg-surface/90">
          <CardContent className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted">
                  Bitcoin
                </p>
                {snapshot ? (
                  <div className="mt-1 flex flex-wrap items-baseline gap-3">
                    <p className="font-mono text-3xl tabular-nums text-fg">
                      {formatUsd(snapshot.price, 0)}
                    </p>
                    <p
                      className={cn(
                        "font-mono text-sm tabular-nums",
                        up ? "text-up" : "text-down",
                      )}
                    >
                      {formatPct(rangePct)}
                      <span className="ml-1.5 text-muted">{range}</span>
                    </p>
                  </div>
                ) : (
                  <Skeleton className="mt-2 h-9 w-40" />
                )}
              </div>
              <Tabs value={range} onValueChange={(value) => setRange(value as ChartRange)}>
                <TabsList className="flex-wrap">
                  {RANGES.map((item) => (
                    <TabsTrigger key={item} value={item} className="min-w-11">
                      {item}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>
            {loading || !points ? (
              <Skeleton className="h-64 w-full sm:h-80" />
            ) : points.length ? (
              <PriceChart data={points} range={range} />
            ) : (
              <p className="grid h-64 place-items-center text-sm text-muted">
                Chart unavailable. Retry in a moment.
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="bg-surface/90">
          <CardContent className="space-y-0 p-0">
            <div className="border-b border-border px-5 py-4">
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted">
                Live statistics
              </p>
            </div>
            {snapshot ? (
              <dl>
                <StatRow label="Spot" value={formatUsd(snapshot.price, 0)} />
                <StatRow
                  label="24h change"
                  value={formatPct(snapshot.change24hPct)}
                  tone={up ? "up" : "down"}
                />
                <StatRow label="24h high" value={formatUsd(snapshot.high24h, 0)} />
                <StatRow label="24h low" value={formatUsd(snapshot.low24h, 0)} />
                <StatRow label="24h volume" value={formatBtc(snapshot.volume24hBtc, 0)} />
                <StatRow label="Sats / dollar" value={formatNumber(snapshot.satsPerDollar, 0)} />
                <StatRow label="Block height" value={formatNumber(snapshot.blockHeight)} last />
              </dl>
            ) : (
              <div className="space-y-3 p-5">
                {Array.from({ length: 7 }).map((_, i) => (
                  <Skeleton key={i} className="h-5 w-full" />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

function changeOverRange(
  points: ChartPoint[] | null,
  spot: number | undefined,
  fallback: number,
): number {
  if (!points || points.length < 2) return fallback;
  const start = points[0]?.price;
  const end = spot ?? points[points.length - 1]?.price;
  if (!start || !end) return fallback;
  return ((end - start) / start) * 100;
}

function StatRow({
  label,
  value,
  tone,
  last,
}: {
  label: string;
  value: string;
  tone?: "up" | "down";
  last?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-4 px-5 py-3.5",
        !last && "border-b border-border",
      )}
    >
      <dt className="text-sm text-muted">{label}</dt>
      <dd
        className={cn(
          "font-mono text-sm tabular-nums text-fg",
          tone === "up" && "text-up",
          tone === "down" && "text-down",
        )}
      >
        {value}
      </dd>
    </div>
  );
}
