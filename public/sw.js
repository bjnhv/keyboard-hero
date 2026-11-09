// Keyboard Hero - Offline-First Service Worker (Production-Grade PWA)
const CACHE_NAME = 'keyboard-hero-v6';

const PRECACHE_ROUTES = [
  '/',
  '/learn',
  '/stats',
  '/arcade',
  '/arcade/redline',
  '/arcade/defuse',
];

const PRECACHE_STATIC_ASSETS = [
  '/manifest.webmanifest',
  '/manifest.json',
  '/favicon.ico',
  '/icons/icon.svg',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/maskable-512.png',
  '/icons/apple-touch-icon.png',
  '/og-image.png',
  '/sounds/cs/bombpl.wav',
  '/sounds/cs/c4_beep1.wav',
  '/sounds/cs/c4_disarm.wav',
  '/sounds/cs/c4_explode1.wav',
  '/sounds/cs/bombdef.wav',
  '/sounds/cs/ctwin.wav',
  '/sounds/cs/terwin.wav',
  '/sounds/cs/letsgo.wav',
];

/**
 * Fetches an HTML route and recursively precaches all Next.js static
 * chunks and CSS files referenced in its HTML document.
 */
async function precacheRouteWithAssets(cache, routeUrl) {
  try {
    const response = await fetch(routeUrl, { cache: 'no-cache' });
    if (!response || !response.ok) return;

    // Cache the HTML under both the full URL and clean pathname
    await cache.put(routeUrl, response.clone());

    const html = await response.text();
    // Match all script src="/_next/static/..." and link href="/_next/static/..."
    const regex = /(?:src|href)="(\/_next\/static\/[^"]+)"/g;
    let match;
    const assetFetches = [];

    while ((match = regex.exec(html)) !== null) {
      const assetPath = match[1];
      assetFetches.push(
        cache.match(assetPath).then((cached) => {
          if (!cached) {
            return fetch(assetPath)
              .then((res) => {
                if (res && res.ok) {
                  return cache.put(assetPath, res);
                }
              })
              .catch(() => {});
          }
        })
      );
    }

    await Promise.allSettled(assetFetches);
  } catch (err) {
    console.warn('[PWA SW] Precache route warning:', routeUrl, err);
  }
}

// Install: Immediately precache routes, their scripts/styles, and activate
self.addEventListener('install', (event) => {
  self.skipWaiting();

  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      // 1. Precache static assets (icons, manifest, favicon)
      await Promise.allSettled(
        PRECACHE_STATIC_ASSETS.map(async (url) => {
          try {
            const res = await fetch(url, { cache: 'no-cache' });
            if (res && res.ok) {
              await cache.put(url, res);
            }
          } catch {}
        })
      );

      // 2. Precache core pages and all their bundled JS/CSS chunks
      await Promise.allSettled(
        PRECACHE_ROUTES.map((route) => precacheRouteWithAssets(cache, route))
      );
    })
  );
});

// Activate: Immediately take control of all open pages and purge old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      self.clients.claim(),
      caches.keys().then((cacheNames) =>
        Promise.all(
          cacheNames.map((name) => {
            if (name !== CACHE_NAME) {
              return caches.delete(name);
            }
          })
        )
      ),
    ])
  );
});

// Fetch: Offline interceptor
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignore non-GET requests or external browser-extension requests
  if (request.method !== 'GET' || !url.protocol.startsWith('http')) {
    return;
  }

  // 1. API routes & Auth: Network only (Dexie.js queues offline mutations in IndexedDB)
  if (url.pathname.startsWith('/api/')) {
    return;
  }

  // 2. HTML Navigation Requests: Network-First with robust Cache Fallback
  const isHtmlNavigation =
    request.mode === 'navigate' ||
    (request.headers.get('accept') && request.headers.get('accept').includes('text/html'));

  if (isHtmlNavigation) {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, clone);
              cache.put(url.pathname, clone.clone());
            });
          }
          return networkResponse;
        })
        .catch(async () => {
          const cache = await caches.open(CACHE_NAME);

          // 1. Exact match with query params
          let cached = await cache.match(request);
          if (cached) return cached;

          // 2. Clean pathname match
          cached = await cache.match(url.pathname);
          if (cached) return cached;

          // 3. Search-ignored match
          cached = await cache.match(request, { ignoreSearch: true });
          if (cached) return cached;

          // 4. Route specific fallback
          if (url.pathname.startsWith('/learn')) {
            cached = await cache.match('/learn');
            if (cached) return cached;
          }
          if (url.pathname.startsWith('/stats')) {
            cached = await cache.match('/stats');
            if (cached) return cached;
          }
          if (url.pathname.startsWith('/arcade')) {
            cached = (await cache.match('/arcade/redline')) || (await cache.match('/arcade'));
            if (cached) return cached;
          }

          // 5. Global Home Page fallback
          cached = await cache.match('/');
          if (cached) return cached;

          // 6. Built-in resilient offline shell
          return new Response(
            `<!DOCTYPE html>
            <html lang="en">
            <head>
              <meta charset="utf-8" />
              <meta name="viewport" content="width=device-width, initial-scale=1" />
              <title>Keyboard Hero - Offline</title>
              <style>
                body { background: #090d16; color: #f8fafc; font-family: system-ui, -apple-system, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 1rem; text-align: center; }
                .card { max-width: 440px; padding: 2.5rem; border: 1px solid rgba(56, 189, 248, 0.35); border-radius: 1.25rem; background: #0f172a; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5); }
                h1 { color: #38bdf8; font-size: 1.5rem; margin-top: 0; margin-bottom: 0.75rem; font-weight: 800; }
                p { color: #94a3b8; font-size: 0.925rem; line-height: 1.6; margin-bottom: 1.5rem; }
                .btn { display: inline-block; padding: 0.65rem 1.4rem; background: #38bdf8; color: #090d16; text-decoration: none; font-weight: 700; border-radius: 0.65rem; font-size: 0.875rem; transition: background 0.2s; }
                .btn:hover { background: #7dd3fc; }
              </style>
            </head>
            <body>
              <div class="card">
                <h1>⚡ Keyboard Hero Offline</h1>
                <p>You are practicing offline. All keystrokes, accuracy metrics, and stage progress are securely stored in local IndexedDB.</p>
                <a href="/learn" class="btn">Launch Offline Practice</a>
              </div>
            </body>
            </html>`,
            {
              status: 200,
              headers: { 'Content-Type': 'text/html; charset=utf-8' },
            }
          );
        })
    );
    return;
  }

  // 3. Next.js Static Bundles, JS Chunks, CSS, Audio, Fonts, Icons:
  // Cache-First with Background Stale-While-Revalidate
  const isStaticAsset =
    url.pathname.startsWith('/_next/') ||
    url.pathname.startsWith('/icons/') ||
    url.pathname.endsWith('.js') ||
    url.pathname.endsWith('.css') ||
    url.pathname.endsWith('.svg') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.ico') ||
    url.pathname.endsWith('.woff2') ||
    url.pathname.endsWith('.webmanifest') ||
    url.pathname.endsWith('.json') ||
    url.pathname.endsWith('.mp3') ||
    url.pathname.endsWith('.wav');

  if (isStaticAsset) {
    event.respondWith(
      caches.open(CACHE_NAME).then(async (cache) => {
        const cachedResponse = await cache.match(request);
        if (cachedResponse) {
          // Revalidate in background when connected
          fetch(request)
            .then((networkResponse) => {
              if (networkResponse && networkResponse.status === 200) {
                cache.put(request, networkResponse.clone());
              }
            })
            .catch(() => {});
          return cachedResponse;
        }

        // Not in cache: fetch from network and store for next offline run
        return fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              cache.put(request, networkResponse.clone());
            }
            return networkResponse;
          })
          .catch(() => {
            return new Response('', { status: 404, statusText: 'Offline Asset Not Found' });
          });
      })
    );
    return;
  }

  // 4. Fallback for all other GET requests (e.g. Next.js RSC prefetches)
  event.respondWith(
    caches.match(request).then((cached) => {
      return (
        cached ||
        fetch(request).catch(() => {
          return new Response('', { status: 404, statusText: 'Offline' });
        })
      );
    })
  );
});
