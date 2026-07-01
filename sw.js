/* =========================================
   Debt Manager — Service Worker
   Network-first: always tries to fetch the
   latest files when online, and only falls
   back to the cache when you're offline.
   This is deliberate — a cache-first strategy
   here would add a second layer of caching on
   top of the browser's, making it even harder
   to tell if you're looking at the latest code.
========================================= */

const CACHE_NAME = "debt-manager-v1";

const PRECACHE_URLS = [
    "./",
    "./index.html",
    "./manifest.json",
    "./icons/icon-192.png",
    "./icons/icon-512.png"
];

self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
    );
    self.skipWaiting();
});

self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
        )
    );
    self.clients.claim();
});

self.addEventListener("fetch", (event) => {

    // Only handle GET requests for same-origin app files.
    if (event.request.method !== "GET") return;

    event.respondWith(
        fetch(event.request)
            .then((response) => {
                const copy = response.clone();
                caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
                return response;
            })
            .catch(() => caches.match(event.request))
    );
});
