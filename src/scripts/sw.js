import { precacheAndRoute } from "workbox-precaching";
import { registerRoute, setCatchHandler } from "workbox-routing";
import { CacheFirst, StaleWhileRevalidate } from "workbox-strategies";
import { ExpirationPlugin } from "workbox-expiration";
import { CacheableResponsePlugin } from "workbox-cacheable-response";

// 💾 Precache semua yang ditentukan oleh Webpack InjectManifest (__WB_MANIFEST)
precacheAndRoute(self.__WB_MANIFEST);

// 📚 Data story dari Story API
registerRoute(
  ({ url }) =>
    url.origin === "https://story-api.dicoding.dev" &&
    url.pathname.startsWith("/v1/stories"),
  new StaleWhileRevalidate({
    cacheName: "story-api-cache",
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 5 * 60, // Cache selama 5 menit
      }),
    ],
  })
);

// 📦 Google Fonts (CSS & Fonts)
registerRoute(
  ({ url }) =>
    url.origin === "https://fonts.googleapis.com" ||
    url.origin === "https://fonts.gstatic.com",
  new StaleWhileRevalidate({
    cacheName: "google-fonts-cache",
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({ maxEntries: 20 }),
    ],
  })
);
registerRoute(
  ({ url }) =>
    url.origin === "https://api.maptiler.com" &&
    url.pathname.startsWith("/maps/streets/"),
  new CacheFirst({
    cacheName: "map-tiles-cache",
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 7 * 24 * 60 * 60, // 7 hari
      }),
    ],
  })
);

registerRoute(
  ({ url }) =>
    url.origin === "https://api.maptiler.com" &&
    url.pathname.startsWith("/geocoding/"),
  new StaleWhileRevalidate({
    cacheName: "maptiler-geocode-cache",
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({ maxEntries: 20 }),
    ],
  })
);

// 📦 CDN (SweetAlert2, Font Awesome, dll)
registerRoute(
  ({ url }) =>
    url.origin.includes("cdn.jsdelivr.net") ||
    url.origin.includes("cdnjs.cloudflare.com"),
  new CacheFirst({
    cacheName: "cdn-assets-cache",
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({ maxEntries: 30 }),
    ],
  })
);

// 📷 Gambar dari Story API
registerRoute(
  ({ url }) =>
    url.href.startsWith("https://story-api.dicoding.dev/images/stories/"),
  new CacheFirst({
    cacheName: "story-images-cache",
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 7 * 24 * 60 * 60, // 7 hari
      }),
    ],
  })
);

// 🧠 Fallback Offline (untuk HTML document)
setCatchHandler(async ({ event }) => {
  if (event.request.destination === "document") {
    return caches.match("/index.html");
  }
  return Response.error();
});

// ⚡ Service Worker lifecycle (install dan activate)
self.addEventListener("install", () => {
  console.log("[Service Worker] Installed");
  self.skipWaiting(); // Langsung aktif
});

self.addEventListener("activate", (event) => {
  console.log("[Service Worker] Activated");
  event.waitUntil(self.clients.claim()); // Kendalikan semua tab
});
// 📩 Handle Push Notification
self.addEventListener("push", function (event) {
  const options = {
    body: event.data.text(),
  };

  event.waitUntil(self.registration.showNotification("Berita Baru", options));
});

// 📲 Handle Notification Click
self.addEventListener("notificationclick", function (event) {
  const url = "/add-story";
  event.notification.close();
  event.waitUntil(clients.openWindow(url));
});
