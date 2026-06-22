import { state, setNested } from './state.js';
import { emit, on } from './events.js';
import { openDb } from './db/idb.js';
import { tripsRepo, rawRepo, eventsRepo, offlinePackRepo } from './db/repositories.js';
import { initRouter, render, navigate } from './router.js';
import { importClipboard, saveText } from './capture/clipboard.js';
import { saveFiles } from './capture/fileImport.js';
import { consumeShareTarget } from './capture/shareTarget.js';
import { rebuildOfflinePack } from './offline/packBuilder.js';
import { downloadText } from './offline/exportText.js';
import { fetchWeather } from './online/openMeteo.js';
import { fetchDestinationGuide } from './online/wikimedia.js';
import { fetchCurrency } from './online/currency.js';
import { revealForHold } from './offline/panicMode.js';
let deferredInstallPrompt;
async function refreshState() {
  state.trips = await tripsRepo.all();
  state.activeTrip = state.trips.find(t => t.status === 'active') || state.trips.sort((a,b)=>String(b.updatedAt||'').localeCompare(String(a.updatedAt||'')))[0] || null;
  state.activeTripId = state.activeTrip?.id || null;
  state.rawItems = (await rawRepo.all()).sort((a,b)=>String(b.createdAt).localeCompare(String(a.createdAt)));
  state.events = state.activeTripId ? await eventsRepo.byIndex('tripId', state.activeTripId) : [];
  const packs = state.activeTripId ? await offlinePackRepo.byIndex('tripId', state.activeTripId) : [];
  state.pack = packs.sort((a,b)=>String(b.generatedAt).localeCompare(String(a.generatedAt)))[0] || null;
}
function toast(message) { const el = document.getElementById('toast'); el.textContent = message; el.hidden = false; clearTimeout(toast.timer); toast.timer = setTimeout(()=>el.hidden=true, 3200); }
async function boot() {
  document.documentElement.dataset.theme = state.ui.theme;
  await openDb();
  initRouter();
  bindNetwork(); bindInstall(); bindAfterRender();
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js').catch(console.warn);
  await consumeShareTarget().catch(err => console.warn('No share target payload consumed', err));
  await refreshState();
  if (new URLSearchParams(location.search).has('shared')) navigate('dump'); else render();
  emit('app:init');
}
function bindNetwork() {
  const update = () => { state.online = navigator.onLine; const badge = document.getElementById('networkBadge'); if (badge) { badge.textContent = state.online ? 'Autopilot Active' : 'Lifeboat Offline'; badge.classList.toggle('offline', !state.online); } emit(state.online?'network:online':'network:offline'); };
  addEventListener('online', update); addEventListener('offline', update); update();
}
function bindInstall() {
  addEventListener('beforeinstallprompt', e => { e.preventDefault(); deferredInstallPrompt = e; document.getElementById('installRail').hidden = false; });
  document.getElementById('installButton')?.addEventListener('click', async () => { if (!deferredInstallPrompt) return; deferredInstallPrompt.prompt(); document.getElementById('installRail').hidden = true; });
}
function bindAfterRender() {
  addEventListener('screen:rendered', () => {
    document.getElementById('clipboardBtn')?.addEventListener('click', async () => { try { toast('Saved offline. Reading it now…'); await importClipboard(); await refreshState(); render(); toast('Clipboard saved. Offline pack refreshed.'); } catch(e) { toast(e.message || 'Clipboard unavailable. Paste manually.'); } });
    document.getElementById('saveTextBtn')?.addEventListener('click', async () => { const text = document.getElementById('manualText').value; if (!text.trim()) return toast('Paste travel text first.'); toast('Saved offline. Reading it now…'); await saveText(text, 'manual', 'Manual paste'); await refreshState(); render(); toast('Text saved. Trip updated.'); });
    document.getElementById('fileInput')?.addEventListener('change', async e => { toast('Saved offline. Reading it now…'); await saveFiles(e.target.files, 'upload').catch(err=>toast(err.message)); await refreshState(); render(); toast('Files saved. Offline pack refreshed.'); });
    document.getElementById('cameraInput')?.addEventListener('change', async e => { toast('Photo saved offline. Reading it now…'); await saveFiles(e.target.files, 'camera').catch(err=>toast(err.message)); await refreshState(); render(); });
    const secret = document.getElementById('codesSecret'); const reveal = document.getElementById('revealCodes'); if (secret && reveal) revealForHold(reveal, secret);
    document.getElementById('copyPack')?.addEventListener('click', async () => { await navigator.clipboard.writeText(state.pack.exports.plainText); toast('Family-safe text copied.'); });
    document.getElementById('downloadMd')?.addEventListener('click', () => downloadText('tripbrief-pack.md', state.pack.exports.markdown, 'text/markdown'));
    document.getElementById('downloadHtml')?.addEventListener('click', () => downloadText('tripbrief-pack.html', state.pack.exports.printableHtml, 'text/html'));
    document.getElementById('downloadIcs')?.addEventListener('click', () => downloadText('tripbrief-pack.ics', state.pack.exports.ics, 'text/calendar'));
    document.getElementById('themeToggle')?.addEventListener('click', () => { const next = state.ui.theme === 'tripbrief-dark' ? 'tripbrief-light' : 'tripbrief-dark'; setNested('ui.theme', next); localStorage.setItem('tb-theme', next); document.documentElement.dataset.theme = next; render(); });
  });
}
on('pack:ready', async () => { await refreshState(); });
window.tripbrief = { state, refreshState, rebuildOfflinePack, fetchWeather, fetchDestinationGuide, fetchCurrency };
boot().catch(err => { console.error(err); document.getElementById('app').innerHTML = `<section class="card pad"><h1>TripBrief could not start</h1><p>${err.message}</p></section>`; });
