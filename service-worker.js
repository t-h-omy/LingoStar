const CACHE_NAME = 'lingostar-v1.5.0';
const urlsToCache = [
  './',
  './index.html',
  './styles.css',
  './js/main.js',
  './js/ui.js',
  './js/storage.js',
  './js/exercises.js',
  './lingostar_verbs.json',
  './assets/sounds/sfx_correct.mp3',
  './assets/sounds/sfx_incorrect.mp3',
  './assets/sounds/sfx_freeze.mp3',
  './assets/sounds/sfx_unfreeze.mp3',
  './assets/images/star_neutral_384.png',
  './assets/images/star_neutral_384_32.png',
  './assets/images/star_neutral_384_64.png',
  './assets/images/star_yellow_384.png',
  './assets/images/star_yellow_384_32.png',
  './assets/images/star_yellow_384_64.png',
  './assets/images/star_yellow_384_frozen.png',
  './assets/images/star_yellow_384_frozen_32.png',
  './assets/images/star_yellow_384_frozen_64.png',
  './assets/images/star_rosa_384.png',
  './assets/images/star_rosa_384_32.png',
  './assets/images/star_rosa_384_64.png',
  './assets/images/star_rosa_384_frozen.png',
  './assets/images/star_rosa_384_frozen_32.png',
  './assets/images/star_rosa_384_frozen_64.png',
  './assets/images/star_blue_384.png',
  './assets/images/star_blue_384_32.png',
  './assets/images/star_blue_384_64.png',
  './assets/images/star_blue_384_frozen.png',
  './assets/images/star_blue_384_frozen_32.png',
  './assets/images/star_blue_384_frozen_64.png',
  './assets/images/star_purple_384.png',
  './assets/images/star_purple_384_32.png',
  './assets/images/star_purple_384_64.png',
  './assets/images/star_purple_384_frozen.png',
  './assets/images/star_purple_384_frozen_32.png',
  './assets/images/star_purple_384_frozen_64.png',
  './assets/images/star_orange_384.png',
  './assets/images/star_orange_384_32.png',
  './assets/images/star_orange_384_64.png',
  './assets/images/star_orange_384_frozen.png',
  './assets/images/star_orange_384_frozen_32.png',
  './assets/images/star_orange_384_frozen_64.png',
  './assets/images/star_broken_384.png',
  './assets/images/star_broken_384_32.png',
  './assets/images/star_broken_384_64.png'
];

// Install event - cache resources
self.addEventListener('install', event => {
  // Skip waiting to activate immediately
  self.skipWaiting();
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        
        // Clone the request because it can only be used once
        const fetchRequest = event.request.clone();
        
        return fetch(fetchRequest).then(response => {
          // Check if valid response
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          
          // Clone the response because it can only be used once
          const responseToCache = response.clone();
          
          // Update cache with new response
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });
          
          return response;
        });
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  // Claim clients immediately
  event.waitUntil(
    clients.claim().then(() => {
      return caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== CACHE_NAME) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      });
    })
  );
});

// Message event - handle commands from the app
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
