// Service worker voor het Alchemist Coach Dashboard.
// Alleen de app-schil wordt bewaard; data van Supabase gaat nooit via de cache.
const CACHE = 'coach-dashboard-v4';
const SCHIL = ['./Alchemist_coach_dashboard.html', './coach-icon-192.png', './coach-icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SCHIL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
// Netwerk eerst (altijd de nieuwste versie); alleen offline valt hij terug op de bewaarde schil
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin) return;
  e.respondWith(
    fetch(e.request).then(r => {
      if (r.ok) { const kopie = r.clone(); caches.open(CACHE).then(c => c.put(e.request, kopie)); }
      return r;
    }).catch(() => caches.match(e.request, { ignoreSearch: true }))
  );
});
