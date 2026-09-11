/**
 * TAJHO TV - SMART TV SERVICE WORKER & PWA INSTALLER
 * Enables instant standalone installation on Hisense VIDAA OS & Android TV
 */

const CACHE_NAME = 'tajho-tv-v3';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './styles_senior.css',
  './app_senior.js',
  './channels_senior.js',
  './logo.png',
  './manifest.json',
  'https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800;900;950&display=swap',
  'https://cdn.jsdelivr.net/npm/hls.js@1.5.8/dist/hls.min.js'
];

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

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const url = event.request.url;

  // Do not cache live streams or API proxy requests
  if (url.includes('.m3u8') || url.includes('.ts') || url.includes('/proxy') || url.includes('/api/')) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).catch(() => {
        return caches.match('./index.html');
      });
    })
  );
});
