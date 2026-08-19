import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { getBitcoinHeadlines, type Headline } from "@/lib/news";

export function NewsFeed() {
  const [headlines, setHeadlines] = useState<Headline[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getBitcoinHeadlines()
      .then((next) => {
        if (!cancelled) setHeadlines(next);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Unable to load headlines");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <article className="rounded-xl bg-surface/90 p-6 shadow-[var(--shadow-border)] sm:p-8">
      <p className="text-sm text-muted">
        Latest from Bitcoin-only community desks — Optech, Stacker News, The Rage, TFTC, Lopp, Delving,
        Core, and The Bitcoin Manual. No CoinDesk. No ETF desks.
      </p>

      {error ? <p className="mt-4 text-sm text-down">{error}</p> : null}

      {!headlines && !error ? (
        <ul className="mt-6 space-y-4">
          {Array.from({ length: 6 }, (_, i) => (
            <li key={i}>
              <Skeleton className="h-4 w-24" />
              <Skeleton className="mt-2 h-5 w-full" />
            </li>
          ))}
        </ul>
      ) : null}

      {headlines && headlines.length === 0 ? (
        <p className="mt-4 text-sm text-muted">No recent headlines from those feeds.</p>
      ) : null}

      {headlines && headlines.length > 0 ? (
        <ul className="mt-6 divide-y divide-border/80">
          {headlines.map((item) => (
            <li key={item.id} className="py-4 first:pt-0 last:pb-0">
              <a
                href={item.url}
                target="_blank"
                rel="noreferrer"
                className="group block space-y-1.5"
              >
                <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted">
                  {item.source}
                  <span className="mx-2 text-subtle">·</span>
                  <time dateTime={new Date(item.publishedAt).toISOString()}>
                    {formatRelative(item.publishedAt)}
                  </time>
                </p>
                <p className="text-base text-fg transition-colors duration-150 group-hover:text-accent">
                  {item.title}
                </p>
                {item.summary ? (
                  <p className="line-clamp-2 text-sm leading-relaxed text-muted">{item.summary}</p>
                ) : null}
              </a>
            </li>
          ))}
        </ul>
      ) : null}
    </article>
  );
}

function formatRelative(ts: number): string {
  const delta = Date.now() - ts;
  const minutes = Math.round(delta / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 48) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 14) return `${days}d ago`;
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(new Date(ts));
}
