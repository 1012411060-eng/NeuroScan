/**
 * ============================================================================
 * NeuroScan — Service Worker (PWA Offline Capability & Cache Management)
 * Course: Web Technology (ETCS336) | Unit V PWA Requirement
 * ============================================================================
 */

const CACHE_NAME = 'neuroscan-cache-v1.0.0';
const STATIC_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './css/styles.css',
  './js/app.js',
  './js/config.js',
  './js/state/store.js',
  './js/services/api.js',
  './js/services/auth.js',
  './js/services/mriPresets.js',
  './js/components/navbar.js',
  './js/components/patientPortal.js',
  './js/components/canvasViewer.js',
  './js/components/aiDiagnostics.js',
  './js/components/reportModal.js',
  './js/components/syllabusModal.js',
  './js/utils/security.js',
  './js/utils/toast.js',
  './js/utils/keyboard.js'
];

// Install Event: Pre-cache core application shell
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing NeuroScan App Shell...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Caching static assets');
      return cache.addAll(STATIC_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// Activate Event: Clear outdated caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating & cleaning previous caches...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('[Service Worker] Deleting obsolete cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event: Stale-While-Revalidate Strategy for Static Assets & Network-First for APIs
self.addEventListener('fetch', (event) => {
  const requestUrl = new URL(event.request.url);

  // If API request, attempt network first with offline fallback
  if (requestUrl.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(event.request).catch(() => {
        return new Response(
          JSON.stringify({
            offline: true,
            message: 'NeuroScan is running in offline mode. Client-side diagnostic engine active.'
          }),
          {
            headers: { 'Content-Type': 'application/json' }
          }
        );
      })
    );
    return;
  }

  // For static assets, apply Cache-First / Stale-While-Revalidate
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Fetch and update cache in background
        fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, networkResponse);
            });
          }
        }).catch(() => {/* Ignore network fetch errors while offline */});
        return cachedResponse;
      }
      return fetch(event.request);
    })
  );
});
