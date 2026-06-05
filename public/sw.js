const CACHE_NAME = "pm-v5";

self.addEventListener("install", (e) => {
  // Pre-cache only tiny stable assets — never JS bundles (hashes change every deploy)
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(["/manifest.json", "/favicon.ico"]).catch(() => {}))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  // Delete every old cache version immediately
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;

  const url = new URL(e.request.url);

  // Never intercept API calls
  if (url.pathname.startsWith("/api/") || url.origin !== self.location.origin) return;

  // HTML navigation — always network-first so new deploys load instantly
  if (e.request.mode === "navigate") {
    e.respondWith(
      fetch(e.request)
        .then((res) => {
          // Cache a copy of the page for offline fallback
          const clone = res.clone();
          caches.open(CACHE_NAME).then((c) => c.put(e.request, clone));
          return res;
        })
        .catch(() => caches.match(e.request).then((r) => r || caches.match("/")))
    );
    return;
  }

  // JS / CSS bundles — network-first (ensures fresh files after every deploy)
  // Falls back to cache only when offline
  if (url.pathname.match(/\.(js|css)$/)) {
    e.respondWith(
      fetch(e.request)
        .then((res) => {
          if (res && res.status === 200) {
            const clone = res.clone();
            caches.open(CACHE_NAME).then((c) => c.put(e.request, clone));
          }
          return res;
        })
        .catch(() => caches.match(e.request))
    );
    return;
  }

  // Everything else (images, fonts) — cache-first
  e.respondWith(
    caches.match(e.request).then((cached) => {
      if (cached) return cached;
      return fetch(e.request).then((res) => {
        if (res && res.status === 200) {
          const clone = res.clone();
          caches.open(CACHE_NAME).then((c) => c.put(e.request, clone));
        }
        return res;
      });
    })
  );
});

self.addEventListener("push", (e) => {
  const data = e.data?.json() || { title: "RelicSnap", body: "You have a new notification" };
  e.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: "/logo192.png",
      badge: "/favicon.ico",
      tag: data.tag || "relicsnap-notif",
      data: { url: data.url || "/" },
    })
  );
});

self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  e.waitUntil(
    clients.matchAll({ type: "window" }).then((list) => {
      const target = e.notification.data?.url || "/";
      for (const client of list) {
        if (client.url.includes(self.location.origin) && "focus" in client) {
          client.navigate(target);
          return client.focus();
        }
      }
      if (clients.openWindow) return clients.openWindow(target);
    })
  );
});
