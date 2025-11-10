const CACHE_NAME = 'lingostar-v1.2.0';
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
  './assets/images/star_yellow_384.png',
  './assets/images/star_yellow_384_frozen.png',
  './assets/images/star_rosa_384.png',
  './assets/images/star_rosa_384_frozen.png',
  './assets/images/star_blue_384.png',
  './assets/images/star_blue_384_frozen.png',
  './assets/images/star_purple_384.png',
  './assets/images/star_purple_384_frozen.png',
  './assets/images/star_orange_384.png',
  './assets/images/star_orange_384_frozen.png',
  './assets/images/star_broken_384.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
