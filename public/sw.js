const CACHE_NAME = 'powher-lifts-v1.2.1-b20260729';

// Install Service Worker and activate immediately
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[ServiceWorker] Pre-caching static media assets');
      return cache.addAll([
        '/icon.png',
        '/icon.svg',
        '/manifest.json'
      ]).catch((err) => console.warn('[ServiceWorker] Pre-cache warning:', err));
    })
  );
});

// Activate service worker and purge ALL old cache versions
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('[ServiceWorker] Purging outdated cache version:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Message listener to handle manual skipWaiting trigger
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Fetch event handling
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Only handle GET requests
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Network-First strategy for HTML Navigation, JS bundles, CSS bundles, manifest files, and asset chunks
  const isNavigation = request.mode === 'navigate' || request.headers.get('accept')?.includes('text/html');
  const isCodeOrManifest = url.pathname.endsWith('.js') ||
                           url.pathname.endsWith('.css') ||
                           url.pathname.endsWith('.json') ||
                           url.pathname.includes('/assets/');

  if (isNavigation || isCodeOrManifest) {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseCopy = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              if (isNavigation) {
                cache.put('/index.html', responseCopy);
              } else {
                cache.put(request, responseCopy);
              }
            });
          }
          return networkResponse;
        })
        .catch(() => {
          console.log('[ServiceWorker] Network unavailable for:', request.url, '- using cached fallback');
          if (isNavigation) {
            return caches.match('/index.html').then((res) => res || caches.match('/'));
          }
          return caches.match(request);
        })
    );
    return;
  }

  // Cache-First with Network Fallback for other static resources (e.g. images)
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseCopy = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, responseCopy));
        }
        return networkResponse;
      });
    })
  );
});
