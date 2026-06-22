import { rawRepo } from '../db/repositories.js';
import { id, hashText } from '../utils/ids.js';
import { nowIso } from '../utils/dates.js';
import { parseRawItem } from '../parser/parserPipeline.js';
import { emit } from '../events.js';
export async function saveText(text, source='manual', title='Travel text') {
  const item = { id:id('raw'), tripId:null, kind:'text', title, mimeType:'text/plain', text, extractedText:'', ocrStatus:'none', parseStatus:'queued', hash: await hashText(text), source, createdAt:nowIso(), updatedAt:nowIso() };
  await rawRepo.put(item); emit('capture:received', { rawItemId:item.id }); await parseRawItem(item); return item;
}
export async function importClipboard() {
  if (!navigator.clipboard?.readText) throw new Error('Clipboard read is unavailable here. Paste manually instead.');
  const text = await navigator.clipboard.readText();
  if (!text.trim()) throw new Error('Clipboard did not contain text.');
  return saveText(text, 'clipboard', 'Clipboard import');
}
