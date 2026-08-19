import { createServerFn } from "@tanstack/react-start";

export type Headline = {
  id: string;
  title: string;
  url: string;
  source: string;
  publishedAt: number;
};

const FEEDS = [
  { source: "Bitcoin Magazine", url: "https://bitcoinmagazine.com/.rss/full/" },
  { source: "CoinDesk", url: "https://www.coindesk.com/arc/outboundfeeds/rss/" },
];

function decode(value: string): string {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&/g, "&")
    .replace(/</g, "<")
    .replace(/>/g, ">")
    .replace(/"/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/<[^>]+>/g, "")
    .trim();
}

function parseItems(xml: string, source: string): Headline[] {
  const blocks = xml.match(/<item[\s\S]*?<\/item>/gi) ?? xml.match(/<entry[\s\S]*?<\/entry>/gi) ?? [];
  const headlines: Headline[] = [];
  for (const block of blocks.slice(0, 8)) {
    const title = decode(block.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? "");
    const link =
      decode(block.match(/<link[^>]*>([\s\S]*?)<\/link>/i)?.[1] ?? "") ||
      block.match(/<link[^>]+href="([^"]+)"/i)?.[1] ||
      "";
    const guid = decode(block.match(/<guid[^>]*>([\s\S]*?)<\/guid>/i)?.[1] ?? "") || link;
    const pub = block.match(/<(?:pubDate|published|updated)[^>]*>([\s\S]*?)<\/(?:pubDate|published|updated)>/i)?.[1];
    if (!title || !link) continue;
    headlines.push({
      id: guid || `${source}:${title}`,
      title,
      url: link,
      source,
      publishedAt: pub ? Date.parse(pub) || Date.now() : Date.now(),
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
      headers: { "user-agent": "antbit-desk/1.0", accept: "application/rss+xml, application/xml, text/xml" },
    });
    if (!res.ok) return [];
    return parseItems(await res.text(), source);
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
    return lists
      .flat()
      .sort((a, b) => b.publishedAt - a.publishedAt)
      .filter((item) => {
        if (seen.has(item.id) || seen.has(item.title)) return false;
        seen.add(item.id);
        seen.add(item.title);
        return true;
      })
      .slice(0, 12);
  },
);
