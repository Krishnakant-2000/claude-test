// AmaPlayer Service Worker - Phase 1: Foundation
// Basic service worker with static asset caching as per offline caching documentation

const STATIC_CACHE = 'amaplayer-static-v1';
const STATIC_ASSETS = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/static/media/',
  '/manifest.json',
  '/favicon.ico',
  '/logo192.png',
  '/logo512.png'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('SW Phase 1: Installing service worker');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('SW Phase 1: Caching static assets');
        return cache.addAll(STATIC_ASSETS.filter(asset => asset !== '/static/media/'));
      })
      .then(() => {
        // Cache media directory separately to handle potential errors
        return caches.open(STATIC_CACHE).then(cache => {
          return fetch('/static/media/').then(response => {
            if (response.ok) {
              return cache.put('/static/media/', response);
            }
          }).catch(() => {
            // Media directory might not exist, that's ok
            console.log('SW Phase 1: Media directory not found, skipping');
          });
        });
      })
      .catch((error) => {
        console.log('SW Phase 1: Failed to cache some static assets:', error);
      })
  );
  
  // Force activation of new service worker
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('SW Phase 1: Activating service worker');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => {
              return cacheName.startsWith('amaplayer-') && 
                     cacheName !== STATIC_CACHE;
            })
            .map((cacheName) => {
              console.log('SW Phase 1: Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            })
        );
      })
  );
  
  // Take control of all clients
  self.clients.claim();
});

// Fetch event - basic caching strategy
self.addEventListener('fetch', (event) => {
  const { request } = event;
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Skip Chrome extension requests
  if (request.url.startsWith('chrome-extension:')) {
    return;
  }
  
  // Cache first strategy for static assets
  if (isStaticAsset(request)) {
    event.respondWith(handleStaticAsset(request));
  } else {
    // Network first for dynamic content
    event.respondWith(handleDynamicRequest(request));
  }
});

// Check if request is for static assets
function isStaticAsset(request) {
  const url = new URL(request.url);
  return url.pathname.startsWith('/static/') ||
         url.pathname.endsWith('.js') ||
         url.pathname.endsWith('.css') ||
         url.pathname.endsWith('.ico') ||
         url.pathname.endsWith('.png') ||
         url.pathname.endsWith('.jpg') ||
         url.pathname.endsWith('.svg') ||
         url.pathname === '/' ||
         url.pathname === '/manifest.json';
}

// Handle static assets with cache-first strategy
async function handleStaticAsset(request) {
  try {
    const cache = await caches.open(STATIC_CACHE);
    const cached = await cache.match(request);
    
    if (cached) {
      console.log('SW Phase 1: Serving from cache:', request.url);
      return cached;
    }
    
    console.log('SW Phase 1: Fetching and caching:', request.url);
    const response = await fetch(request);
    
    if (response.status === 200) {
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    console.log('SW Phase 1: Static asset fetch failed:', error);
    
    // Return a basic offline response
    if (request.url.endsWith('.html') || request.mode === 'navigate') {
      return new Response(
        `<!DOCTYPE html>
        <html>
        <head>
          <title>Offline - AmaPlayer</title>
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { 
              font-family: Arial, sans-serif; 
              text-align: center; 
              padding: 50px; 
              background: #f5f5f5; 
            }
            .offline-message { 
              background: white; 
              padding: 30px; 
              border-radius: 10px; 
              box-shadow: 0 2px 10px rgba(0,0,0,0.1); 
            }
          </style>
        </head>
        <body>
          <div class="offline-message">
            <h2>You're Offline</h2>
            <p>Check your connection and try again.</p>
            <button onclick="window.location.reload()">Retry</button>
          </div>
        </body>
        </html>`,
        {
          headers: { 'Content-Type': 'text/html' }
        }
      );
    }
    
    return new Response('Offline', { status: 503 });
  }
}

// Handle dynamic requests with network-first strategy
async function handleDynamicRequest(request) {
  try {
    const response = await fetch(request);
    return response;
  } catch (error) {
    console.log('SW Phase 1: Dynamic request failed:', error);
    
    // For navigation requests, return offline page
    if (request.mode === 'navigate') {
      const cache = await caches.open(STATIC_CACHE);
      const cached = await cache.match('/');
      return cached || new Response('Offline', { status: 503 });
    }
    
    return new Response('Offline', { status: 503 });
  }
}

console.log('SW Phase 1: Service worker script loaded');