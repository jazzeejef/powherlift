const CACHE_NAME = 'powerherlift-app-shell-v1.2.2';

const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon.png',
  '/icon.svg'
];

// Installation: pre-cache application shell and skip waiting immediately
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[ServiceWorker] Pre-caching application shell:', CACHE_NAME);
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn('[ServiceWorker] Pre-cache non-fatal warning:', err);
      });
    })
  );
});

// Activation: delete obsolete application shell caches and claim clients
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('[ServiceWorker] Deleting obsolete cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => {
      console.log('[ServiceWorker] Claiming clients for:', CACHE_NAME);
      return self.clients.claim();
    })
  );
});

// Listen for messages from client
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Helper for fetch with timeout
function fetchWithTimeout(request, timeoutMs) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  return fetch(request, { signal: controller.signal })
    .finally(() => clearTimeout(id));
}

// Controlled offline fallback HTML shell
const OFFLINE_FALLBACK_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>PowerHerLift - Offline</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #fff5f8; color: #334155; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 1rem; text-align: center; }
    .card { background: white; padding: 2rem; border-radius: 1.5rem; box-shadow: 0 10px 25px -5px rgba(244, 114, 182, 0.2); max-width: 400px; border: 1px solid #fce7f3; }
    h1 { color: #db2777; font-size: 1.5rem; margin-bottom: 0.5rem; }
    p { font-size: 0.875rem; color: #64748b; line-height: 1.5; }
    button { background: linear-gradient(135deg, #ec4899, #9333ea); color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 0.75rem; font-weight: bold; cursor: pointer; margin-top: 1rem; }
  </style>
</head>
<body>
  <div class="card">
    <h1>PowerHerLift</h1>
    <p>You are currently offline. PowerHerLift loads cached workout data automatically when reconnected.</p>
    <button onclick="window.location.reload()">Retry Connection</button>
  </div>
</body>
</html>`;

// Fetch event handling
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Only handle GET requests
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  const isNavigation = request.mode === 'navigate' || request.headers.get('accept')?.includes('text/html');
  const isHashedAsset = url.pathname.includes('/assets/') ||
                        url.pathname.endsWith('.js') ||
                        url.pathname.endsWith('.css');

  // Strategy 1: Navigation requests -> Stale-While-Revalidate with Timeout
  if (isNavigation) {
    event.respondWith(
      caches.match('/index.html').then((cachedIndex) => {
        // Trigger background fetch to refresh cached index.html for future launches
        const backgroundFetch = fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const responseCopy = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put('/index.html', responseCopy));
            }
            return networkResponse;
          })
          .catch((err) => console.log('[ServiceWorker] Background index fetch notice (offline/slow):', err));

        // If cached index.html exists, serve immediately!
        if (cachedIndex) {
          return cachedIndex;
        }

        // If no cached index exists, attempt network fetch with 2800ms timeout
        return fetchWithTimeout(request, 2800)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const responseCopy = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put('/index.html', responseCopy));
            }
            return networkResponse;
          })
          .catch(() => {
            // Controlled fallback if neither cache nor network are available
            return new Response(OFFLINE_FALLBACK_HTML, {
              headers: { 'Content-Type': 'text/html' }
            });
          });
      })
    );
    return;
  }

  // Strategy 2: Hashed JS & CSS Assets -> Strict Cache-First (Immutable versioned assets)
  if (isHashedAsset) {
    event.respondWith(
      caches.match(request).then((cachedAsset) => {
        if (cachedAsset) {
          return cachedAsset;
        }

        // Fetch from network if not in cache
        return fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const responseCopy = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(request, responseCopy));
            }
            return networkResponse;
          })
          .catch((err) => {
            console.error('[ServiceWorker] Asset fetch failed:', request.url, err);
            // Return 404 response - NEVER substitute index.html for a JS or CSS file!
            return new Response('Code asset unavailable in cache or network', {
              status: 404,
              statusText: 'Not Found',
              headers: { 'Content-Type': 'text/plain' }
            });
          });
      })
    );
    return;
  }

  // Strategy 3: Other Static Assets (manifest, icons, images, fonts) -> Cache-First with Network Fallback
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseCopy = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, responseCopy));
          }
          return networkResponse;
        })
        .catch(() => {
          return new Response('Resource unavailable offline', { status: 503 });
        });
    })
  );
});
