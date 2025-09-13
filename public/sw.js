const CACHE_NAME = 'farm-management-v1.0.0';
const API_CACHE = 'farm-api-v1.0.0';

const STATIC_ASSETS = [
  '/',
  '/icon512_maskable.png',
  '/icon512_rounded.png',
  '/manifest.json'
];

const API_ENDPOINTS = [
  '/api/dashboard/stats',
  '/api/training',
  '/api/alerts'
];

// Install event
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .catch((error) => {
        console.error('[SW] Cache install failed:', error);
      })
  );
  self.skipWaiting();
});


// Activate event
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== API_CACHE) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Handle API requests
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      caches.open(API_CACHE).then((cache) => {
        return fetch(request)
          .then((response) => {
            // Cache successful GET requests
            if (request.method === 'GET' && response.status === 200) {
              cache.put(request, response.clone());
            }
            return response;
          })
          .catch(() => {
            // Return cached version if network fails
            return cache.match(request).then((cachedResponse) => {
              if (cachedResponse) {
                console.log('[SW] Returning cached API response for:', url.pathname);
                return cachedResponse;
              }
              // Return offline page for critical endpoints
              return new Response(JSON.stringify({
                error: 'Offline',
                message: 'No network connection available',
                cached: false
              }), {
                status: 503,
                headers: { 'Content-Type': 'application/json' }
              });
            });
          });
      })
    );
    return;
  }

  // Handle static assets
  event.respondWith(
    caches.match(request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(request).then((response) => {
          // Cache successful responses
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        });
      })
      .catch(() => {
        // Return offline fallback for navigation requests
        if (request.mode === 'navigate') {
          return caches.match('/');
        }
        return new Response('Offline', { status: 503 });
      })
  );
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event.tag);
  
  if (event.tag === 'sync-scans') {
    event.waitUntil(syncOfflineScans());
  } else if (event.tag === 'sync-compliance') {
    event.waitUntil(syncOfflineCompliance());
  }
});

async function syncOfflineScans() {
  try {
    // Get offline scans from IndexedDB
    const offlineScans = await getOfflineData('scans');
    
    for (const scan of offlineScans) {
      try {
        const response = await fetch('/api/scan', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${scan.token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(scan.data)
        });
        
        if (response.ok) {
          await removeOfflineData('scans', scan.id);
          console.log('[SW] Synced offline scan:', scan.id);
        }
      } catch (error) {
        console.log('[SW] Failed to sync scan:', error);
      }
    }
  } catch (error) {
    console.log('[SW] Sync scans error:', error);
  }
}

async function syncOfflineCompliance() {
  try {
    const offlineCompliance = await getOfflineData('compliance');
    
    for (const item of offlineCompliance) {
      try {
        const formData = new FormData();
        Object.keys(item.data).forEach(key => {
          formData.append(key, item.data[key]);
        });
        
        const response = await fetch('/api/compliance', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${item.token}`
          },
          body: formData
        });
        
        if (response.ok) {
          await removeOfflineData('compliance', item.id);
          console.log('[SW] Synced offline compliance:', item.id);
        }
      } catch (error) {
        console.log('[SW] Failed to sync compliance:', error);
      }
    }
  } catch (error) {
    console.log('[SW] Sync compliance error:', error);
  }
}

// IndexedDB helpers (simplified)
async function getOfflineData(store) {
  // This would interface with IndexedDB
  // For demo purposes, return empty array
  return [];
}

async function removeOfflineData(store, id) {
  // This would remove from IndexedDB
  console.log(`Removing offline data: ${store}/${id}`);
}

// Push notification handling
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'New farm alert available',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    vibrate: [200, 100, 200],
    tag: 'farm-alert',
    actions: [
      { action: 'view', title: 'View Alert' },
      { action: 'dismiss', title: 'Dismiss' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('Farm Management Alert', options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'view') {
    event.waitUntil(
      clients.openWindow('/alerts')
    );
  }
});

console.log('[SW] Service worker script loaded');