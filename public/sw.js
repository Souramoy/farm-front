// public/sw.js

const CACHE_NAME = "farm-management-v1.0.0";
const STATIC_ASSETS = [
  "/",
  "/manifest.json",
  "/icon512_rounded.png",
  "/icon512_maskable.png",
];

// ✅ Install event
self.addEventListener("install", (event) => {
  console.log("[SW] Installing...");
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// ✅ Activate event (cleanup old caches)
self.addEventListener("activate", (event) => {
  console.log("[SW] Activating...");
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log("[SW] Removing old cache:", key);
            return caches.delete(key);
          }
        })
      )
    )
  );
  self.clients.claim();
});

// ✅ Fetch handler
self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Don’t cache API requests → always go to network first
  if (request.url.includes("/api/")) {
    event.respondWith(
      fetch(request).catch(() => {
        return new Response(
          JSON.stringify({
            error: "Offline",
            message: "API unavailable offline",
          }),
          {
            status: 503,
            headers: { "Content-Type": "application/json" },
          }
        );
      })
    );
    return;
  }

  // Cache-first strategy for static assets + pages
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => {
        if (
          response &&
          response.status === 200 &&
          request.method === "GET" &&
          request.url.startsWith(self.location.origin)
        ) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return response;
      });
    })
  );
});

// ✅ Push notifications
self.addEventListener("push", (event) => {
  const data = event.data ? event.data.text() : "New farm update available!";
  event.waitUntil(
    self.registration.showNotification("Farm Management", {
      body: data,
      icon: "/icon512_rounded.png",
      badge: "/icon512_maskable.png",
    })
  );
});

// ✅ Notification click
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(clients.openWindow("/alerts"));
});

console.log("[SW] Loaded and running ✅");