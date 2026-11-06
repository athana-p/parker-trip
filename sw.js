// Offline play: cache the game's own files; serve from cache first, refresh in the background.
// Bump CACHE when files change so players get the new version.
const CACHE = 'parker-trip-v22';
const ASSETS = ['./', 'index.html', 'manifest.webmanifest', 'css/style.css',
  'js/paper.js', 'js/bg.js', 'js/parker.js', 'js/strings.js', 'js/postcards.js', 'js/items.js', 'js/festivals.js', 'js/props.js', 'js/friends.js', 'js/visitors.js', 'js/yard.js', 'js/weather.js',
  'js/habits.js', 'js/audio.js', 'js/save.js', 'js/world.js', 'js/ui.js', 'js/game.js',
  'icons/icon-192.png', 'icons/icon-512.png', 'icons/icon-maskable-512.png', 'icons/apple-touch-icon.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(caches.open(CACHE).then(async c => {
    const hit = await c.match(e.request, { ignoreSearch: true });
    const net = fetch(e.request).then(r => { if (r.ok) c.put(e.request, r.clone()); return r; }).catch(() => hit);
    return hit || net;
  }));
});
