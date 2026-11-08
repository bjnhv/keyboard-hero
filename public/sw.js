// Keyboard Hero - Offline-First Service Worker
const CACHE_NAME = 'keyboard-hero-v1';
const PRECACHE_ASSETS = [
  '/',
  '/learn',
  '/stats',
  '/arcade',
  '/arcade/redline',
  '/icons/icon.svg',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/maskable-512.png',
];

// Install: Pre-cache application shell and core pages
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_ASSETS))
      .then(() => self.skipWaiting())
      .catch((err) => console.warn('[PWA SW] Precache warning:', err))
  );
});

// Activate: Purge old cache versions and claim immediate control
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) =>
        Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME)
            .map((name) => caches.delete(name))
        )
      )
      .then(() => self.clients.claim())
  );
});

// Fetch: Strategy depending on request type
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests or browser-extension requests
  if (request.method !== 'GET' || !url.protocol.startsWith('http')) {
    return;
  }

  // 1. API routes: Network only (offline mutations are preserved in Dexie.js syncQueue)
  if (url.pathname.startsWith('/api/')) {
    return;
  }

  // 2. Next.js Static chunks and images: Cache-First / Stale-While-Revalidate
  if (
    url.pathname.startsWith('/_next/static/') ||
    url.pathname.startsWith('/icons/') ||
    url.pathname.endsWith('.svg') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.woff2')
  ) {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) =>
        cache.match(request).then((cachedResponse) => {
          if (cachedResponse) {
            // Revalidate in background
            fetch(request)
              .then((networkResponse) => {
                if (networkResponse.status === 200) {
                  cache.put(request, networkResponse.clone());
                }
              })
              .catch(() => {});
            return cachedResponse;
          }
          return fetch(request).then((networkResponse) => {
            if (networkResponse.status === 200) {
              cache.put(request, networkResponse.clone());
            }
            return networkResponse;
          });
        })
      )
    );
    return;
  }

  // 3. Navigation (HTML Pages): Network-First with Offline Cache Fallback
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
          }
          return networkResponse;
        })
        .catch(async () => {
          const cache = await caches.open(CACHE_NAME);
          const cachedResponse = await cache.match(request);
          if (cachedResponse) {
            return cachedResponse;
          }
          // Fallback to cached home page or learn page if target route not cached
          const fallback = (await cache.match('/learn')) || (await cache.match('/'));
          return fallback || new Response('Offline: Page not cached yet.', { status: 503 });
        })
    );
    return;
  }

  // 4. Default: Stale-While-Revalidate
  event.respondWith(
    caches.match(request).then((cached) => cached || fetch(request))
  );
});
