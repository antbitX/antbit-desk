export const ALERTS_KEY = "antbit.alerts";

export type AlertSettings = {
  enabled: boolean;
  priceMoves: boolean;
  threshold: number;
  news: boolean;
};

const DEFAULTS: AlertSettings = {
  enabled: false,
  priceMoves: true,
  threshold: 1000,
  news: true,
};

export function isIos(): boolean {
  if (typeof navigator === "undefined") return false;
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

export function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    ("standalone" in navigator && Boolean((navigator as Navigator & { standalone?: boolean }).standalone))
  );
}

export function loadAlertSettings(): AlertSettings {
  try {
    const raw = localStorage.getItem(ALERTS_KEY);
    if (!raw) return { ...DEFAULTS };
    return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULTS };
  }
}

export function saveAlertSettings(settings: AlertSettings) {
  localStorage.setItem(ALERTS_KEY, JSON.stringify(settings));
}

export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return null;
  try {
    return await navigator.serviceWorker.register("/sw.js", { scope: "/" });
  } catch {
    return null;
  }
}

export async function notify(title: string, body: string, tag: string) {
  const registration = await navigator.serviceWorker?.ready.catch(() => null);
  if (registration) {
    registration.active?.postMessage({ type: "NOTIFY", title, body, tag, url: "/" });
    return;
  }
  if ("Notification" in window && Notification.permission === "granted") {
    new Notification(title, { body, tag, icon: "/icon-192.png" });
  }
}
