import { createServerFn } from "@tanstack/react-start";

export type Headline = {
  id: string;
  title: string;
  url: string;
  source: string;
  summary: string;
  publishedAt: number;
};

const FEEDS: { source: string; url: string }[] = [
  { source: "Bitcoin Optech", url: "https://bitcoinops.org/feed.xml" },
  { source: "Stacker News", url: "https://stacker.news/~bitcoin/rss" },
  { source: "The Rage", url: "https://www.therage.co/rss/" },
  { source: "TFTC", url: "https://www.tftc.io/rss.xml" },
  { source: "The Bitcoin Manual", url: "https://thebitcoinmanual.com/feed/" },
  { source: "Jameson Lopp", url: "https://blog.lopp.net/rss/" },
  { source: "Delving Bitcoin", url: "https://delvingbitcoin.org/latest.rss" },
  { source: "Bitcoin Core", url: "https://bitcoincore.org/en/rss.xml" },
];

function decode(value: string): string {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&/g, "&")
    .replace(/</g, "<")
    .replace(/>/g, ">")
    .replace(/"/g, '"')
    .replace(/&#39;|'/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCharCode(parseInt(n, 16)))
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tag(block: string, name: string): string {
  return decode(block.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`, "i"))?.[1] ?? "");
}

function attr(block: string, name: string, attrName: string): string {
  return (
    block.match(new RegExp(`<${name}[^>]+${attrName}="([^"]+)"`, "i"))?.[1] ??
    block.match(new RegExp(`<${name}[^>]+${attrName}='([^']+)'`, "i"))?.[1] ??
    ""
  );
}

function parseDate(value: string): number {
  const ts = Date.parse(value);
  return Number.isFinite(ts) ? ts : 0;
}

function parseFeed(xml: string, source: string): Headline[] {
  const blocks = xml.match(/<item[\s\S]*?<\/item>/gi) ?? xml.match(/<entry[\s\S]*?<\/entry>/gi) ?? [];
  const headlines: Headline[] = [];
  for (const block of blocks.slice(0, 8)) {
    const title = tag(block, "title");
    const link =
      tag(block, "link") ||
      attr(block, "link", "href") ||
      tag(block, "id");
    const guid = tag(block, "guid") || tag(block, "id") || link;
    const summary = tag(block, "description") || tag(block, "summary") || tag(block, "content");
    const published =
      tag(block, "pubDate") ||
      tag(block, "published") ||
      tag(block, "updated") ||
      tag(block, "dc:date");
    if (!title || !link) continue;
    if (/^https?:\/\/stacker\.news\/items\/\d+$/i.test(link) === false && source === "noop") continue;
    headlines.push({
      id: guid || `${source}:${title}`,
      title,
      url: link,
      source,
      summary: summary.slice(0, 220),
      publishedAt: parseDate(published) || Date.now(),
    });
  }
  return headlines;
}

async function fetchFeed(source: string, url: string): Promise<Headline[]> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 8000);
  try {
    const res = await fetch(url, {
      signal: ctrl.signal,
      redirect: "follow",
      headers: {
        "user-agent": "antbit-desk/1.0",
        accept: "application/rss+xml, application/atom+xml, application/xml, text/xml, */*",
      },
    });
    if (!res.ok) return [];
    return parseFeed(await res.text(), source);
  } catch {
    return [];
  } finally {
    clearTimeout(timer);
  }
}

export const getBitcoinHeadlines = createServerFn({ method: "GET" }).handler(
  async (): Promise<Headline[]> => {
    const lists = await Promise.all(FEEDS.map((feed) => fetchFeed(feed.source, feed.url)));
    const seen = new Set<string>();
    const cutoff = Date.now() - 1000 * 60 * 60 * 24 * 120;
    return lists
      .flat()
      .filter((item) => item.publishedAt >= cutoff)
      .sort((a, b) => b.publishedAt - a.publishedAt)
      .filter((item) => {
        const key = item.title.toLowerCase();
        if (seen.has(item.id) || seen.has(key)) return false;
        seen.add(item.id);
        seen.add(key);
        return true;
      })
      .slice(0, 18);
  },
);
