/**
 * TAJHO TV - SMART TV SERVICE WORKER & PWA INSTALLER
 * Enables instant standalone installation on Hisense VIDAA OS & Android TV
 */

const CACHE_NAME = 'tajho-tv-v7-luxury-cards';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './styles_senior.css?v=7.0',
  './app_senior.js?v=7.0',
  './channels_senior.js?v=7.0',
  './logo.png',
  './manifest.json',
  'https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800;900;950&display=swap',
  'https://cdn.jsdelivr.net/npm/hls.js@1.5.8/dist/hls.min.js'
];

// Install: Cache immediately and activate
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE).catch((err) => {
        console.warn('[SW] Non-critical asset cache skip:', err);
      });
    })
  );
});

// Activate: Delete ALL old caches (v1, v2, v3, v4, v5, etc.) immediately
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[SW] Purging outdated cache:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch: NETWORK-FIRST for HTML/CSS/JS/assets, with Cache Fallback for offline
self.addEventListener('fetch', (event) => {
  const url = event.request.url;

  // Never intercept or cache live streams, TS chunks, or proxy APIs
  if (
    url.includes('.m3u8') ||
    url.includes('.ts') ||
    url.includes('/proxy') ||
    url.includes('/api/') ||
    event.request.method !== 'GET'
  ) {
    return;
  }

  // Network-First strategy: fetch live from GitHub/Server first
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // Fallback to cache when offline
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          if (event.request.headers.get('accept')?.includes('text/html')) {
            return caches.match('./index.html');
          }
        });
      })
  );
});
