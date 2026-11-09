// Offline shell for Planner v2.3. All paths remain relative to the Pages subdirectory.
const CACHE = 'planner-v2.3-shell-20261109';
const CORE = ['./', './index.html', './manifest.webmanifest', './icons/icon-192.png', './icons/icon-512.png'];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(Promise.all([
    caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith('planner-') && key !== CACHE).map(key => caches.delete(key)))),
    self.clients.claim()
  ]));
});
self.addEventListener('fetch', event => {
  const req = event.request;
  const url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== self.location.origin || !url.href.startsWith(self.registration.scope)) return;
  if (req.mode === 'navigate') {
    event.respondWith(fetch(req).then(async response => {
      if (response.ok) { const cache = await caches.open(CACHE); await cache.put(new URL('index.html', self.registration.scope), response.clone()); }
      return response;
    }).catch(async () => (await caches.match(new URL('index.html', self.registration.scope))) || Response.error()));
    return;
  }
  event.respondWith(caches.match(req).then(hit => hit || fetch(req).then(async response => {
    if (response.ok) { const cache = await caches.open(CACHE); await cache.put(req, response.clone()); }
    return response;
  })));
});
