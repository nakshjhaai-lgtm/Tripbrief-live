const CACHE_NAME = 'tripbrief-live-shell-v2';
const RUNTIME_CACHE = 'tripbrief-live-runtime-v2';
const SHARE_CACHE = 'tripbrief-live-share-v1';
const APP_SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './css/animations.css',
  './css/app.css',
  './css/components.css',
  './css/theme.css',
  './js/events.js',
  './js/main.js',
  './js/router.js',
  './js/state.js',
  './js/capture/camera.js',
  './js/capture/clipboard.js',
  './js/capture/fileImport.js',
  './js/capture/shareTarget.js',
  './js/db/idb.js',
  './js/db/migrations.js',
  './js/db/repositories.js',
  './js/db/schema.js',
  './js/ocr/imagePreprocess.js',
  './js/ocr/ocrWorker.js',
  './js/ocr/tesseractAdapter.js',
  './js/offline/exportHtml.js',
  './js/offline/exportIcs.js',
  './js/offline/exportMarkdown.js',
  './js/offline/exportText.js',
  './js/offline/packBuilder.js',
  './js/offline/panicMode.js',
  './js/online/apiCache.js',
  './js/online/currency.js',
  './js/online/nominatim.js',
  './js/online/openMeteo.js',
  './js/online/overpass.js',
  './js/online/wikimedia.js',
  './js/parser/addressParser.js',
  './js/parser/confidence.js',
  './js/parser/confirmationParser.js',
  './js/parser/dateParser.js',
  './js/parser/flightParser.js',
  './js/parser/hotelParser.js',
  './js/parser/parserPipeline.js',
  './js/security/crypto.js',
  './js/security/redaction.js',
  './js/security/vault.js',
  './js/ui/components.js',
  './js/ui/motion.js',
  './js/ui/render.js',
  './js/utils/dates.js',
  './js/utils/ids.js',
  './js/utils/text.js',
  './js/ui/screens/DocumentsScreen.js',
  './js/ui/screens/DumpScreen.js',
  './js/ui/screens/HomeScreen.js',
  './js/ui/screens/PackScreen.js',
  './js/ui/screens/PanicScreen.js',
  './js/ui/screens/ReadinessScreen.js',
  './js/ui/screens/SettingsScreen.js',
  './js/ui/screens/TimelineScreen.js',
  './assets/textures/paper-noise.svg',
  './assets/icons/icon-192.png',
  './assets/icons/icon-512.png',
  './assets/icons/maskable-512.png'
];
self.addEventListener('install', event => { event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL)).then(() => self.skipWaiting())); });
self.addEventListener('activate', event => { event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => ![CACHE_NAME, RUNTIME_CACHE, SHARE_CACHE].includes(k)).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (url.pathname.endsWith('/share-target') && event.request.method === 'POST') { event.respondWith(handleShare(event.request)); return; }
  if (event.request.mode === 'navigate') { event.respondWith(fetch(event.request).catch(() => caches.match('/index.html'))); return; }
  if (event.request.method !== 'GET') return;
  event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request).then(res => {
    const copy = res.clone();
    if (url.origin === location.origin || /open-meteo|wikimedia|frankfurter|nominatim|overpass/i.test(url.hostname)) caches.open(RUNTIME_CACHE).then(cache => cache.put(event.request, copy));
    return res;
  }).catch(() => cached)));
});
async function handleShare(request) {
  const form = await request.formData();
  const shareId = `share-${Date.now()}`;
  const payload = { id: shareId, title: form.get('title') || '', text: form.get('text') || '', url: form.get('url') || '', files: [], createdAt: new Date().toISOString() };
  const cache = await caches.open(SHARE_CACHE);
  const files = form.getAll('files').filter(Boolean);
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const path = `/__share__/${shareId}/${i}-${encodeURIComponent(file.name || 'file')}`;
    await cache.put(path, new Response(file, { headers: { 'Content-Type': file.type || 'application/octet-stream', 'X-File-Name': file.name || 'file' } }));
    payload.files.push({ path, name: file.name || 'file', type: file.type || 'application/octet-stream', size: file.size || 0 });
  }
  await cache.put(`/__share__/${shareId}/payload.json`, new Response(JSON.stringify(payload), { headers: { 'Content-Type': 'application/json' } }));
  await cache.put('/__share__/latest.json', new Response(JSON.stringify({ id: shareId }), { headers: { 'Content-Type': 'application/json' } }));
  return Response.redirect(new URL('./?shared=1#dump', self.registration.scope).href, 303);
}
self.addEventListener('message', event => { if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting(); });
