// Simple service worker for offline support + installability.
const CACHE = 'our-memories-v9';
const ASSETS = [
  './',
  'index.html',
  'styles.css',
  'manifest.webmanifest',
  'icon-192.png',
  'icon-512.png',
  'icon-180.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).catch(() => {}));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  // Let Firebase / Google requests go straight to the network (live guestbook sync).
  if (req.url.includes('firestore') || req.url.includes('googleapis') || req.url.includes('gstatic')) return;

  const isPageOrCode = req.mode === 'navigate' ||
    req.destination === 'document' ||
    req.destination === 'style' ||
    req.destination === 'script' ||
    /\.(html|css|js|webmanifest)$/.test(new URL(req.url).pathname);

  if (isPageOrCode) {
    // NETWORK-FIRST: always try to fetch the latest when online, fall back to
    // cache only when offline. This is what makes website updates show up.
    e.respondWith(
      fetch(req)
        .then((res) => {
          if (res.ok && req.url.startsWith(self.location.origin)) {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
          }
          return res;
        })
        .catch(() => caches.match(req))
    );
    return;
  }

  // CACHE-FIRST for static assets like icons/images (rarely change), with a
  // background refresh so new versions are picked up over time.
  e.respondWith(
    caches.match(req).then((cached) => {
      const network = fetch(req)
        .then((res) => {
          if (res.ok && req.url.startsWith(self.location.origin)) {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
          }
          return res;
        })
        .catch(() => cached);
      return cached || network;
    })
  );
});
