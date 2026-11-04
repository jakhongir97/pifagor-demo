// Offline shell + cache-first for hashed assets (incl. the PGlite WASM). API calls never touch this cache.
const CACHE = 'pifagor-parent-v1'
self.addEventListener('install', (e) => { self.skipWaiting() })
self.addEventListener('activate', (e) => { e.waitUntil(self.clients.claim()) })
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url)
  if (e.request.method !== 'GET' || url.origin !== location.origin || url.pathname.includes('/api/')) return
  const hashed = /\/assets\//.test(url.pathname)
  if (hashed) {
    e.respondWith(caches.open(CACHE).then(async (c) => (await c.match(e.request)) || fetch(e.request).then((r) => { if (r.ok) c.put(e.request, r.clone()); return r })))
  } else if (e.request.mode === 'navigate') {
    e.respondWith(fetch(e.request).then((r) => { caches.open(CACHE).then((c) => c.put(e.request, r.clone())); return r }).catch(() => caches.match(e.request)))
  }
})
