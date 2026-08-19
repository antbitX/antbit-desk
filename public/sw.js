const CACHE = "antbit-v1";

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE).then((cache) =>
      cache.addAll(["/", "/manifest.webmanifest", "/icon-192.png", "/apple-touch-icon.png"]),
    ),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))),
    ).then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/api/") || url.pathname.startsWith("/_server")) return;

  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok && url.pathname.match(/\.(js|css|png|jpg|svg|webmanifest)$/)) {
          const copy = response.clone();
          caches.open(CACHE).then((cache) => cache.put(request, copy));
        }
        return response;
      })
      .catch(() => caches.match(request).then((cached) => cached || caches.match("/"))),
  );
});

self.addEventListener("message", (event) => {
  const data = event.data;
  if (!data || data.type !== "NOTIFY") return;
  event.waitUntil(
    self.registration.showNotification(data.title || "antbit", {
      body: data.body || "",
      icon: "/icon-192.png",
      badge: "/icon-192.png",
      tag: data.tag || "antbit",
      renotify: true,
      data: { url: data.url || "/" },
    }),
  );
});

self.addEventListener("push", (event) => {
  let payload = { title: "antbit", body: "Bitcoin update", url: "/" };
  try {
    payload = { ...payload, ...event.data.json() };
  } catch {
    if (event.data) payload.body = event.data.text();
  }
  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      icon: "/icon-192.png",
      badge: "/icon-192.png",
      tag: payload.tag || "antbit-push",
      data: { url: payload.url || "/" },
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const target = event.notification.data?.url || "/";
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if ("focus" in client) {
          client.focus();
          if ("navigate" in client) client.navigate(target);
          return;
        }
      }
      return self.clients.openWindow(target);
    }),
  );
});
