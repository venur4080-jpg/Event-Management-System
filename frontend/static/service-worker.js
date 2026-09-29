/**
 * service-worker.js – EVENTS PWA Service Worker
 * Provides offline support and asset caching.
 */
const CACHE_NAME = 'events-v1';
const STATIC_ASSETS = [
  '/',
  '/dashboard',
  '/static/style.css',
  '/static/script.js',
  '/static/animations.js',
  '/static/themes.js',
  '/static/toast.js',
  '/static/logo.png',
];

// Install – cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// Activate – clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch – network-first for API, cache-first for static
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Always network-first for API endpoints
  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/payment/')) {
    event.respondWith(fetch(event.request).catch(() =>
      new Response(JSON.stringify({ error: 'Offline' }), {
        headers: { 'Content-Type': 'application/json' }
      })
    ));
    return;
  }

  // Cache-first for static files
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        if (response.ok && event.request.method === 'GET') {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((c) => c.put(event.request, clone));
        }
        return response;
      }).catch(() => caches.match('/dashboard'));
    })
  );
});
