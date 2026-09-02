/* PNW & The Rockies — offline service worker */
var CACHE = 'pnw-rockies-v1';

// Core app shell to precache (clean URLs; query strings ignored on match).
var PRECACHE = [
  './',
  './index.html',
  './styles.css',
  './script.js',
  './tracker.js',
  './weather.js',
  './route-map.png',
  './manifest.webmanifest',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE).then(function (c) {
      // Cache what we can; don't fail install if one asset 404s.
      return Promise.all(PRECACHE.map(function (u) {
        return c.add(new Request(u, { cache: 'reload' })).catch(function () {});
      }));
    }).then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.map(function (k) {
        if (k !== CACHE) return caches.delete(k);
      }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;

  var url = new URL(req.url);

  // Never cache the live weather API — always go to network (offline just fails
  // gracefully and the page keeps its static fallback text).
  if (url.hostname.indexOf('open-meteo.com') !== -1) return;

  // HTML navigations: network-first so online visits get fresh content,
  // falling back to the cached shell when offline (e.g. in the parks).
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req).then(function (res) {
        var copy = res.clone();
        caches.open(CACHE).then(function (c) { c.put('./index.html', copy); });
        return res;
      }).catch(function () {
        return caches.match('./index.html', { ignoreSearch: true })
          .then(function (r) { return r || caches.match('./', { ignoreSearch: true }); });
      })
    );
    return;
  }

  // Everything else (CSS/JS/images, Google Fonts): stale-while-revalidate.
  e.respondWith(
    caches.match(req, { ignoreSearch: true }).then(function (cached) {
      var network = fetch(req).then(function (res) {
        if (res && (res.status === 200 || res.type === 'opaque')) {
          var copy = res.clone();
          caches.open(CACHE).then(function (c) { c.put(req, copy); });
        }
        return res;
      }).catch(function () { return cached; });
      return cached || network;
    })
  );
});
