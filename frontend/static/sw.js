/**
 * sw.js / service-worker.js – EVENTS PWA Service Worker & Offline Ticket Wallet
 * Caches essential app shells, styles, scripts, tickets, and provides seamless offline capabilities.
 */
const CACHE_NAME = 'events-pwa-v2.0';
const OFFLINE_URL = '/dashboard';

const PRECACHE_ASSETS = [
  '/',
  '/dashboard',
  '/history',
  '/static/style.css',
  '/static/script.js',
  '/static/animations.js',
  '/static/themes.js',
  '/static/toast.js',
  '/static/pwa.js',
  '/static/logo.png',
  '/static/manifest.json'
];

// Install: Pre-cache core application shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn('[ServiceWorker] Some assets failed to precache:', err);
      });
    })
  );
  self.skipWaiting();
});

// Activate: Purge obsolete cache versions
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[ServiceWorker] Removing old cache version:', key);
            return caches.delete(key);
          }
        })
      )
    )
  );
  self.clients.claim();
});

// Fetch: Strategy routing
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // Ignore non-GET requests and browser extensions
  if (request.method !== 'GET' || !url.protocol.startsWith('http')) {
    return;
  }

  // 1. API & Mutating Endpoints: Network Only with JSON error fallback
  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/payment/') || url.pathname.startsWith('/auth/')) {
    event.respondWith(
      fetch(request).catch(() =>
        new Response(JSON.stringify({ ok: false, offline: true, error: 'You are currently offline. Please reconnect.' }), {
          headers: { 'Content-Type': 'application/json' }
        })
      )
    );
    return;
  }

  // 2. Tickets & Certificates: Cache First, fallback to network and update cache
  if (url.pathname.includes('/download_ticket') || url.pathname.includes('/download_certificate')) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          // Serve cached pass immediately for instant gate presentation
          fetch(request).then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              caches.open(CACHE_NAME).then((cache) => cache.put(request, networkResponse));
            }
          }).catch(() => {});
          return cachedResponse;
        }
        return fetch(request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return networkResponse;
        });
      })
    );
    return;
  }

  // 3. Static Assets (CSS, JS, Images, Fonts): Cache First with background refresh
  if (url.pathname.startsWith('/static/') || url.hostname.includes('fonts.googleapis.com') || url.hostname.includes('fonts.gstatic.com')) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) {
          // Asynchronously update cache in background
          fetch(request).then((fresh) => {
            if (fresh && fresh.status === 200) {
              caches.open(CACHE_NAME).then((cache) => cache.put(request, fresh));
            }
          }).catch(() => {});
          return cached;
        }
        return fetch(request).then((fresh) => {
          if (fresh && fresh.status === 200) {
            const clone = fresh.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return fresh;
        });
      })
    );
    return;
  }

  // 4. HTML Navigation Pages: Network First with Cache Fallback
  event.respondWith(
    fetch(request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const clone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return networkResponse;
      })
      .catch(async () => {
        const cached = await caches.match(request);
        if (cached) return cached;
        const fallback = await caches.match(OFFLINE_URL);
        return fallback || new Response(
          '<!DOCTYPE html><html><head><meta charset="utf-8"><title>Offline | EVENTS</title><style>body{background:#0f172a;color:#fff;font-family:sans-serif;text-align:center;padding:50px;}</style></head><body><h1>📴 You are offline</h1><p>Your saved ticket passes are available in your offline wallet.</p><a href="/history" style="color:#00f2fe;font-weight:bold;">View My Bookings</a></body></html>',
          { headers: { 'Content-Type': 'text/html' } }
        );
      })
  );
});
