// Service Worker for NewBus PWA
const CACHE_NAME = 'newbus-v1';
const RUNTIME_CACHE = 'newbus-runtime-v1';

// Assets to cache immediately on install
const PRECACHE_ASSETS = [
  './',
  './login.html',
  './passenger.html',
  './driver.html',
  './admin.html',
  './style.css',
  './config.js',
  './login/login.css',
  './login/login.js',
  './passenger/passenger.css',
  './passenger/passenger.js',
  './driver/driver.css',
  './driver/driver.js',
  './driver/profile.css',
  './driver/profile.js',
  './admin/admin.css',
  './admin/admin.js',
  './manifest.json',
  // External CDN resources (will be cached on first use)
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800&display=swap',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
  'https://cdn.jsdelivr.net/npm/@microsoft/signalr@7.0.0/dist/browser/signalr.min.js'
];

// Install event - cache assets
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Caching app shell');
        return cache.addAll(PRECACHE_ASSETS.filter(url => {
          // Only cache local assets, external ones will be cached on demand
          return !url.startsWith('http');
        }));
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
    .then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Skip cross-origin requests (unless they're for our CDN resources)
  const url = new URL(event.request.url);
  if (url.origin !== location.origin && 
      !url.href.includes('cdnjs.cloudflare.com') &&
      !url.href.includes('fonts.googleapis.com') &&
      !url.href.includes('unpkg.com') &&
      !url.href.includes('cdn.jsdelivr.net')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        // Return cached version if available
        if (cachedResponse) {
          return cachedResponse;
        }

        // Otherwise fetch from network
        return fetch(event.request)
          .then((response) => {
            // Don't cache non-successful responses
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response
            const responseToCache = response.clone();

            // Cache the fetched response
            caches.open(RUNTIME_CACHE)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return response;
          })
          .catch(() => {
            // If network fails and it's a navigation request, return offline page
            if (event.request.mode === 'navigate') {
              return caches.match('./login.html');
            }
          });
      })
  );
});

// Handle background sync (for offline actions)
self.addEventListener('sync', (event) => {
  console.log('[Service Worker] Background sync:', event.tag);
  // You can add offline action handling here
});

// Handle push notifications
self.addEventListener('push', (event) => {
  console.log('[Service Worker] Push notification received');
  const options = {
    body: event.data ? event.data.text() : 'New notification from NewBus',
    icon: './icons/icon-192x192.png',
    badge: './icons/icon-72x72.png',
    vibrate: [200, 100, 200],
    tag: 'newbus-notification',
    requireInteraction: true
  };

  event.waitUntil(
    self.registration.showNotification('NewBus', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow('./')
  );
});

