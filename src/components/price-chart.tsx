import { useMemo } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ChartPoint, ChartRange } from "@/lib/bitcoin";
import { formatUsd } from "@/lib/format";

export function PriceChart({ data, range }: { data: ChartPoint[]; range: ChartRange }) {
  const chartData = useMemo(
    () => data.map((point) => ({ ...point, label: point.t })),
    [data],
  );
  const up = (data.at(-1)?.price ?? 0) >= (data[0]?.price ?? 0);
  const stroke = up ? "var(--color-up)" : "var(--color-down)";
  const short = range === "1D" || range === "7D";

  return (
    <div className="h-64 w-full sm:h-80">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="btcFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={stroke} stopOpacity={0.28} />
              <stop offset="100%" stopColor={stroke} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="var(--color-border)" vertical={false} />
          <XAxis
            dataKey="t"
            tickFormatter={(t) =>
              short
                ? new Date(t).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric" })
                : new Date(t).toLocaleDateString("en-US", { month: "short", day: "numeric" })
            }
            tick={{ fill: "var(--color-muted)", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            minTickGap={36}
          />
          <YAxis
            domain={["auto", "auto"]}
            tickFormatter={(v) => formatUsd(v, 0)}
            tick={{ fill: "var(--color-muted)", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={72}
          />
          <Tooltip
            contentStyle={{
              background: "var(--color-surface-2)",
              border: "1px solid var(--color-border)",
              borderRadius: 8,
              color: "var(--color-fg)",
            }}
            labelFormatter={(t) =>
              new Date(Number(t)).toLocaleString("en-US", {
                month: "short",
                day: "numeric",
                hour: "numeric",
                minute: "2-digit",
              })
            }
            formatter={(value) => [formatUsd(Number(value), 0), "BTC"]}
          />
          <Area
            type="monotone"
            dataKey="price"
            stroke={stroke}
            strokeWidth={2}
            fill="url(#btcFill)"
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
