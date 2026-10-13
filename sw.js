// Offline support: app shell cached on install, data cached as you go.
const VERSION = 'sh-v3';
const SHELL = ['./', 'index.html', 'css/app.css', 'manifest.webmanifest', 'icons/icon.svg', 'icons/icon-192.png', 'icons/apple-touch-icon.png',
  'js/main.js', 'js/ui.js', 'js/store.js', 'js/srs.js', 'js/tts.js', 'js/speech.js', 'js/hangul.js', 'js/data.js', 'js/art.js', 'js/progress.js',
  'js/learn/scene.js', 'js/learn/words.js', 'js/learn/grammarstep.js', 'js/learn/talk.js', 'js/learn/reviewer.js',
  'js/views/today.js', 'js/views/session.js', 'js/views/path.js', 'js/views/lesson.js', 'js/views/review.js', 'js/views/hangul.js', 'js/views/watch.js',
  'js/views/me.js', 'js/views/welcome.js', 'js/views/placement.js', 'js/views/grammarref.js', 'js/views/words.js', 'js/views/who.js',
  'data/index.json', 'data/grammar.json', 'data/wordbank.json', 'data/hangul.json', 'data/clips.json'];
self.addEventListener('install', (e) => { e.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener('activate', (e) => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET') return;
  if (url.origin !== location.origin && !url.host.includes('fonts.g')) return; // YouTube etc. go to the network
  // stale-while-revalidate
  e.respondWith(caches.open(VERSION).then(async (c) => {
    const hit = await c.match(e.request);
    const net = fetch(e.request).then(r => { if (r.ok || r.type === 'opaque') c.put(e.request, r.clone()); return r; }).catch(() => hit);
    return hit || net;
  }));
});
