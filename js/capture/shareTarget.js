import { saveText } from './clipboard.js';
import { saveFile } from './fileImport.js';
const SHARE_CACHE = 'tripbrief-live-share-v1';
export async function consumeShareTarget() {
  if (!('caches' in window)) return [];
  const cache = await caches.open(SHARE_CACHE);
  const latestRes = await cache.match('/__share__/latest.json');
  if (!latestRes) return [];
  const latest = await latestRes.json();
  const payloadRes = await cache.match(`/__share__/${latest.id}/payload.json`);
  if (!payloadRes) return [];
  const payload = await payloadRes.json();
  const saved = [];
  const text = [payload.title, payload.text, payload.url].filter(Boolean).join('\n');
  if (text.trim()) saved.push(await saveText(text, 'share_target', payload.title || 'Shared travel text'));
  for (const f of payload.files || []) { const res = await cache.match(f.path); if (res) saved.push(await saveFile(new File([await res.blob()], f.name, { type:f.type }), 'share_target')); }
  await cache.delete('/__share__/latest.json');
  return saved;
}
