import { createServerFn } from "@tanstack/react-start";

export type ChartRange = "1D" | "7D" | "30D" | "90D" | "1Y";

export type ChartPoint = {
  t: number;
  price: number;
};

export type NodeSplit = {
  core: number;
  knots: number;
  rdts: number;
  total: number;
};

export type BitcoinSnapshot = {
  price: number;
  open24h: number;
  high24h: number;
  low24h: number;
  change24h: number;
  change24hPct: number;
  volume24hBtc: number;
  marketCap: number;
  athPrice: number;
  athDate: string;
  athDrawdownPct: number;
  circulating: number;
  maxSupply: number;
  remaining: number;
  issuedPct: number;
  difficulty: number;
  blockHeight: number;
  nodes: NodeSplit;
  satsPerDollar: number;
  updatedAt: number;
  sources: string[];
};

const MAX_SUPPLY = 21_000_000;
const SATS = 100_000_000;
const KNOWN_ATH = { price: 126_296, date: "2025-10-06" };

async function fetchText(url: string, timeoutMs = 10_000): Promise<string> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      signal: ctrl.signal,
      headers: { "user-agent": "antbit-desk/1.0" },
    });
    if (!res.ok) throw new Error(`${url} → ${res.status}`);
    return await res.text();
  } finally {
    clearTimeout(timer);
  }
}

async function fetchJson<T>(url: string, timeoutMs = 10_000): Promise<T> {
  const text = await fetchText(url, timeoutMs);
  return JSON.parse(text) as T;
}

function asNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const n = Number(value);
    if (Number.isFinite(n)) return n;
  }
  return null;
}

async function loadSpot(): Promise<{
  price: number;
  open24h: number;
  high24h: number;
  low24h: number;
  volume24hBtc: number;
  source: string;
}> {
  try {
    const [ticker, stats] = await Promise.all([
      fetchJson<{ price: string; volume: string }>(
        "https://api.exchange.coinbase.com/products/BTC-USD/ticker",
      ),
      fetchJson<{ open: string; high: string; low: string; last: string; volume: string }>(
        "https://api.exchange.coinbase.com/products/BTC-USD/stats",
      ),
    ]);
    const price = asNumber(ticker.price) ?? asNumber(stats.last);
    if (!price) throw new Error("no coinbase price");
    return {
      price,
      open24h: asNumber(stats.open) ?? price,
      high24h: asNumber(stats.high) ?? price,
      low24h: asNumber(stats.low) ?? price,
      volume24hBtc: asNumber(stats.volume) ?? asNumber(ticker.volume) ?? 0,
      source: "Coinbase",
    };
  } catch {
    const kraken = await fetchJson<{
      result?: Record<string, { c: string[]; o: string; h: string[]; l: string[]; v: string[] }>;
    }>("https://api.kraken.com/0/public/Ticker?pair=XBTUSD");
    const row = Object.values(kraken.result ?? {})[0];
    if (!row) throw new Error("spot price unavailable");
    const price = asNumber(row.c?.[0]);
    if (!price) throw new Error("spot price unavailable");
    return {
      price,
      open24h: asNumber(row.o) ?? price,
      high24h: asNumber(row.h?.[1]) ?? price,
      low24h: asNumber(row.l?.[1]) ?? price,
      volume24hBtc: asNumber(row.v?.[1]) ?? 0,
      source: "Kraken",
    };
  }
}

async function loadAth(): Promise<{ price: number; date: string; source: string }> {
  try {
    const bars = await fetchJson<number[][]>(
      "https://api.exchange.coinbase.com/products/BTC-USD/candles?granularity=86400",
    );
    const best = bars.reduce(
      (acc, bar) => (bar[2] > acc[2] ? bar : acc),
      [0, 0, 0, 0, 0, 0],
    );
    const high = best[2];
    const date = new Date(best[0] * 1000).toISOString().slice(0, 10);
    if (high >= KNOWN_ATH.price) return { price: high, date, source: "Coinbase" };
  } catch {
    /* fall through */
  }
  return { ...KNOWN_ATH, source: "Clark Moody / Coinbase" };
}

async function loadSupply(): Promise<{ circulating: number; height: number; source: string }> {
  const [supplyRaw, heightRaw] = await Promise.all([
    fetchText("https://blockchain.info/q/totalbc"),
    fetchText("https://blockstream.info/api/blocks/tip/height").catch(() =>
      fetchText("https://blockchain.info/q/getblockcount"),
    ),
  ]);
  const sats = asNumber(supplyRaw.trim());
  const height = asNumber(heightRaw.trim());
  if (!sats || !height) throw new Error("supply unavailable");
  return { circulating: sats / SATS, height, source: "blockchain.info / Blockstream" };
}

async function loadDifficulty(): Promise<{ difficulty: number; source: string }> {
  const raw = await fetchText("https://blockchain.info/q/getdifficulty");
  const difficulty = asNumber(raw.trim());
  if (!difficulty) throw new Error("difficulty unavailable");
  return { difficulty, source: "blockchain.info" };
}

async function loadNodes(): Promise<NodeSplit & { source: string }> {
  try {
    const data = await fetchJson<{
      total_nodes?: number;
      categories?: Record<string, number>;
    }>("https://btcnodes.io/api/software-policy");
    const cats = data.categories ?? {};
    const core = cats.bitcoin_core ?? 0;
    const knots = cats.knots_all ?? 0;
    const rdts = cats.bip110_signaling ?? 0;
    const total = data.total_nodes ?? core + knots;
    if (!total) throw new Error("empty node snapshot");
    return { core, knots, rdts, total, source: "btcnodes.io" };
  } catch {
    const html = await fetchText("https://coin.dance/nodes", 15_000);
    const core = Number(html.match(/>([\d,]+)<\/strong>\s*Bitcoin Core/)?.[1]?.replace(/,/g, ""));
    const knots = Number(html.match(/>([\d,]+)<\/strong>\s*Bitcoin Knots/)?.[1]?.replace(/,/g, ""));
    if (!core || !knots) throw new Error("node counts unavailable");
    return {
      core,
      knots,
      rdts: 0,
      total: core + knots,
      source: "coin.dance",
    };
  }
}

export const getBitcoinSnapshot = createServerFn({ method: "GET" }).handler(
  async (): Promise<BitcoinSnapshot> => {
    const [spot, ath, supply, difficulty, nodes] = await Promise.all([
      loadSpot(),
      loadAth(),
      loadSupply(),
      loadDifficulty(),
      loadNodes(),
    ]);

    const remaining = Math.max(0, MAX_SUPPLY - supply.circulating);
    const change24h = spot.price - spot.open24h;
    const sources = [spot.source, ath.source, supply.source, difficulty.source, nodes.source];

    return {
      price: spot.price,
      open24h: spot.open24h,
      high24h: spot.high24h,
      low24h: spot.low24h,
      change24h,
      change24hPct: spot.open24h ? (change24h / spot.open24h) * 100 : 0,
      volume24hBtc: spot.volume24hBtc,
      marketCap: spot.price * supply.circulating,
      athPrice: ath.price,
      athDate: ath.date,
      athDrawdownPct: ath.price ? ((spot.price - ath.price) / ath.price) * 100 : 0,
      circulating: supply.circulating,
      maxSupply: MAX_SUPPLY,
      remaining,
      issuedPct: (supply.circulating / MAX_SUPPLY) * 100,
      difficulty: difficulty.difficulty,
      blockHeight: supply.height,
      nodes,
      satsPerDollar: SATS / spot.price,
      updatedAt: Date.now(),
      sources,
    };
  },
);

const RANGE_TO_KRAKEN: Record<ChartRange, { interval: number; keep: number }> = {
  "1D": { interval: 15, keep: 96 },
  "7D": { interval: 60, keep: 168 },
  "30D": { interval: 240, keep: 180 },
  "90D": { interval: 1440, keep: 90 },
  "1Y": { interval: 1440, keep: 365 },
};

export const getPriceChart = createServerFn({ method: "GET" })
  .validator((range: ChartRange) => range)
  .handler(async ({ data: range }): Promise<ChartPoint[]> => {
    const spec = RANGE_TO_KRAKEN[range] ?? RANGE_TO_KRAKEN["7D"];
    try {
      const payload = await fetchJson<{
        result?: Record<string, Array<[number, string, string, string, string, string, string, number]>>;
      }>(`https://api.kraken.com/0/public/OHLC?pair=XBTUSD&interval=${spec.interval}`);
      const bars = Object.entries(payload.result ?? {}).find(([key]) => key !== "last")?.[1] ?? [];
      return bars.slice(-spec.keep).map((bar) => ({
        t: bar[0] * 1000,
        price: Number(bar[4]),
      }));
    } catch {
      const granularity = range === "1D" || range === "7D" ? 3600 : 86400;
      const bars = await fetchJson<number[][]>(
        `https://api.exchange.coinbase.com/products/BTC-USD/candles?granularity=${granularity}`,
      );
      const keep = spec.keep;
      return bars
        .slice()
        .sort((a, b) => a[0] - b[0])
        .slice(-keep)
        .map((bar) => ({ t: bar[0] * 1000, price: bar[4] }));
    }
  });
