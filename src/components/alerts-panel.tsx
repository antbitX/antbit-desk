import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { BitcoinSnapshot } from "@/lib/bitcoin";
import { getBitcoinHeadlines, type Headline } from "@/lib/news";
import {
  isIos,
  isStandalone,
  loadAlertSettings,
  notify,
  registerServiceWorker,
  saveAlertSettings,
  type AlertSettings,
} from "@/lib/pwa";
import { formatUsd } from "@/lib/format";

type InstallPrompt = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };

export function AlertsPanel({ snapshot }: { snapshot: BitcoinSnapshot | null }) {
  const [settings, setSettings] = useState<AlertSettings>(loadAlertSettings);
  const [permission, setPermission] = useState<NotificationPermission>(
    typeof Notification === "undefined" ? "denied" : Notification.permission,
  );
  const [ios] = useState(isIos);
  const [standalone, setStandalone] = useState(isStandalone);
  const [installReady, setInstallReady] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const promptRef = useRef<InstallPrompt | null>(null);
  const lastPrice = useRef<number | null>(null);
  const seenNews = useRef<Set<string>>(new Set());
  const primed = useRef(false);

  useEffect(() => {
    void registerServiceWorker();
    setStandalone(isStandalone());
    const onPrompt = (event: Event) => {
      event.preventDefault();
      promptRef.current = event as InstallPrompt;
      setInstallReady(true);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", () => {
      setInstallReady(false);
      setStandalone(true);
      setStatus("Added to your home screen.");
    });
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  useEffect(() => {
    saveAlertSettings(settings);
  }, [settings]);

  useEffect(() => {
    if (!settings.enabled || !snapshot) return;
    const price = snapshot.price;
    if (!primed.current) {
      lastPrice.current = price;
      primed.current = true;
      return;
    }
    const previous = lastPrice.current;
    lastPrice.current = price;
    if (!settings.priceMoves || previous == null) return;
    const delta = price - previous;
    if (Math.abs(delta) < settings.threshold) return;
    const direction = delta > 0 ? "up" : "down";
    void notify(
      `Bitcoin ${direction} ${formatUsd(Math.abs(delta), 0)}`,
      `Now ${formatUsd(price, 0)}`,
      "antbit-price",
    );
  }, [snapshot, settings.enabled, settings.priceMoves, settings.threshold]);

  useEffect(() => {
    if (!settings.enabled || !settings.news) return;
    let cancelled = false;
    const tick = () => {
      getBitcoinHeadlines()
        .then((headlines) => {
          if (cancelled) return;
          maybeNotifyNews(headlines, seenNews.current);
        })
        .catch(() => {});
    };
    tick();
    const id = window.setInterval(tick, 5 * 60_000);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [settings.enabled, settings.news]);

  async function enableAlerts() {
    if (ios && !isStandalone()) {
      setStatus("On iPhone, add antbit to your Home Screen first, then open it from there and tap Enable.");
      return;
    }
    if (!("Notification" in window)) {
      setStatus("This browser does not support notifications.");
      return;
    }
    await registerServiceWorker();
    const result = await Notification.requestPermission();
    setPermission(result);
    if (result !== "granted") {
      setStatus("Notifications were blocked. Enable them in the browser settings for this site.");
      return;
    }
    setSettings((current) => ({ ...current, enabled: true }));
    setStatus("Alerts on. Keep the desk installed — iPhone only delivers them from the Home Screen app.");
  }

  async function install() {
    if (promptRef.current) {
      await promptRef.current.prompt();
      const choice = await promptRef.current.userChoice;
      if (choice.outcome === "accepted") setInstallReady(false);
      return;
    }
    if (ios) {
      setStatus("Safari: tap the Share button, then Add to Home Screen.");
      return;
    }
    setStatus("Open this site in Chrome or Edge, then use the browser menu → Install app / Add to Home screen.");
  }

  return (
    <section id="alerts" className="scroll-mt-24 space-y-4">
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted">Phone</p>
        <h2 className="mt-1 font-display text-2xl text-fg">Install & alerts</h2>
        <p className="mt-1 text-sm text-muted">
          Add the desk to your Home Screen, then get pinged on $1,000 Bitcoin moves and major headlines.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="bg-surface/90">
          <CardHeader>
            <CardTitle>Home Screen</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {standalone ? (
              <p className="text-sm text-up">Running as the installed app.</p>
            ) : ios ? (
              <ol className="list-decimal space-y-2 pl-4 text-sm text-muted">
                <li>Tap the Share icon in Safari (square with an arrow).</li>
                <li>Scroll and tap <span className="text-fg">Add to Home Screen</span>.</li>
                <li>Open <span className="text-fg">antbit</span> from the Home Screen — not from Safari.</li>
              </ol>
            ) : (
              <p className="text-sm text-muted">
                Android Chrome / Edge: use the install banner, or the browser menu → Install app.
              </p>
            )}
            {!standalone ? (
              <Button type="button" onClick={() => void install()}>
                {installReady ? "Install antbit" : ios ? "How to add" : "Add to Home Screen"}
              </Button>
            ) : null}
          </CardContent>
        </Card>

        <Card className="bg-surface/90">
          <CardHeader>
            <CardTitle>Alerts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted">
              Price: notify when BTC moves by ${settings.threshold.toLocaleString()} or more. News: Bitcoin Magazine
              and CoinDesk headlines.
            </p>
            <label className="flex items-center gap-2 text-sm text-fg">
              <input
                type="checkbox"
                checked={settings.priceMoves}
                onChange={(event) => setSettings((current) => ({ ...current, priceMoves: event.target.checked }))}
              />
              Price moves
            </label>
            <label className="flex items-center gap-2 text-sm text-fg">
              <input
                type="checkbox"
                checked={settings.news}
                onChange={(event) => setSettings((current) => ({ ...current, news: event.target.checked }))}
              />
              Bitcoin headlines
            </label>
            {settings.enabled && permission === "granted" ? (
              <Button type="button" variant="outline" onClick={() => setSettings((current) => ({ ...current, enabled: false }))}>
                Turn alerts off
              </Button>
            ) : (
              <Button type="button" onClick={() => void enableAlerts()}>
                Enable alerts
              </Button>
            )}
            {status ? <p className="text-sm text-accent">{status}</p> : null}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

function maybeNotifyNews(headlines: Headline[], seen: Set<string>) {
  if (seen.size === 0) {
    for (const item of headlines) seen.add(item.id);
    return;
  }
  const fresh = headlines.filter((item) => !seen.has(item.id)).slice(0, 2);
  for (const item of fresh) {
    seen.add(item.id);
    void notify(item.source, item.title, `news-${item.id}`);
  }
}
