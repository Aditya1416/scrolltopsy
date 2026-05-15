const CACHE_NAME = 'scrolltopsy-v2';

// During build, Vite generates a manifest at dist/.vite/manifest.json
// The SW reads this to discover all chunk filenames dynamically
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      // Static assets that never change names
      const staticAssets = [
        '/',
        '/manifest.json',
        '/icon-192.png',
        '/icon-512.png',
      ];

      // Fetch the Vite manifest to get hashed chunk names
      try {
        const manifestRes = await fetch('/.vite/manifest.json');
        const manifest = await manifestRes.json();
        const chunks = Object.values(manifest)
          .flatMap(entry => [
            entry.file,
            ...(entry.css || []),
            ...(entry.imports || []),
          ])
          .filter(Boolean)
          .map(f => '/' + f);
        await cache.addAll([...new Set([...staticAssets, ...chunks])]);
      } catch {
        // Fallback: cache static assets only
        await cache.addAll(staticAssets);
      }
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Network-first for API calls
  if (event.request.url.includes('/api/')) {
    event.respondWith(
      fetch(event.request).catch(() =>
        caches.match(event.request)
      )
    );
    return;
  }
  // Cache-first for everything else
  event.respondWith(
    caches.match(event.request).then(cached =>
      cached || fetch(event.request).then(res => {
        const clone = res.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        return res;
      })
    )
  );
});
