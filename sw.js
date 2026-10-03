// Service worker : fonctionnement hors-ligne.
// Le nom du cache DOIT contenir APP_VERSION (vérifié par tests/test_items.mjs) :
// changer de version force l'iPhone à recharger les fichiers à l'ouverture suivante.
const CACHE = 'petits-calculs-0.2.2';
const FICHIERS = [
  './', 'index.html', 'manifest.webmanifest', 'css/app.css',
  'js/app.js', 'js/version.js', 'js/stockage.js', 'js/audio.js', 'js/phrases.js', 'js/themes.js', 'js/ui.js',
  'js/test/items.js', 'js/test/passation.js', 'js/parent/parent.js',
  'icons/icone-180.png', 'icons/icone-192.png', 'icons/icone-512.png',
  'audio/manifest.json', 'audio/silence.mp3'
];

self.addEventListener('install', e => {
  e.waitUntil((async () => {
    const c = await caches.open(CACHE);
    await c.addAll(FICHIERS);
    // Ajoute tous les fichiers audio listés dans le manifeste.
    try {
      const m = await (await fetch('audio/manifest.json', { cache: 'no-cache' })).json();
      await c.addAll(m.ids.map(id => 'audio/' + id + '.mp3'));
    } catch (err) { /* pas d'audio pré-généré : la voix de secours prendra le relais */ }
    self.skipWaiting();
  })());
});

self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    for (const k of await caches.keys()) if (k !== CACHE) await caches.delete(k);
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith((async () => {
    const enCache = await caches.match(e.request, { ignoreSearch: true });
    if (enCache) return enCache;
    try { return await fetch(e.request); }
    catch (err) { return caches.match('index.html'); }
  })());
});
