import { rawRepo } from '../db/repositories.js';
import { id, hashBlob } from '../utils/ids.js';
import { nowIso } from '../utils/dates.js';
import { parseRawItem } from '../parser/parserPipeline.js';
import { runOcrIfNeeded } from '../ocr/tesseractAdapter.js';
import { emit } from '../events.js';
export async function saveFile(file, source='upload') {
  if (file.size > 10 * 1024 * 1024) throw new Error('File is over the MVP 10 MB limit.');
  const kind = file.type.startsWith('image/') ? 'image' : file.type === 'application/pdf' ? 'pdf' : file.type.startsWith('text/') ? 'text' : 'file';
  const item = { id:id('raw'), tripId:null, kind, title:file.name || 'Travel file', mimeType:file.type, text: kind === 'text' ? await file.text() : '', blob:file, extractedText:'', ocrStatus: kind === 'image' ? 'queued' : 'none', parseStatus:'queued', hash: await hashBlob(file), source, createdAt:nowIso(), updatedAt:nowIso() };
  await rawRepo.put(item); emit('capture:received', { rawItemId:item.id });
  if (kind === 'image') await runOcrIfNeeded(item); else await parseRawItem(item);
  return item;
}
export async function saveFiles(files, source='upload') { const saved = []; for (const file of files) saved.push(await saveFile(file, source)); return saved; }
