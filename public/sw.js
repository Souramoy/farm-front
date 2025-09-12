self.addEventListener("install", (event) => {
  console.log("Service Worker installing...");
  event.waitUntil(
    caches.open("farm-cache-v1").then((cache) => {
      return cache.addAll(["/", "/offline.html"]);
    })
  );
});

self.addEventListener("activate", () => {
  console.log("Service Worker activated");
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      return cachedResponse || fetch(event.request);
    })
  );
});
