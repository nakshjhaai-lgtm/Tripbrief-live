import { rawRepo } from '../db/repositories.js';
import { parseRawItem } from '../parser/parserPipeline.js';
import { emit } from '../events.js';
import { preprocessImage } from './imagePreprocess.js';
import { loadScript } from './ocrWorker.js';
let loadPromise;
async function ensureTesseract() {
  if (window.Tesseract) return window.Tesseract;
  loadPromise ||= loadScript('https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js').then(() => window.Tesseract);
  return loadPromise;
}
export async function runOcrIfNeeded(item) {
  if (item.kind !== 'image') return parseRawItem(item);
  item.ocrStatus = 'processing'; await rawRepo.put(item); emit('ocr:queued', { rawItemId:item.id });
  try {
    const Tesseract = await ensureTesseract();
    if (!Tesseract?.recognize) throw new Error('OCR library unavailable');
    const blob = await preprocessImage(item.blob);
    const result = await Tesseract.recognize(blob, 'eng');
    item.extractedText = result?.data?.text || '';
    item.ocrStatus = item.extractedText.trim() ? 'done' : 'failed';
  } catch (error) {
    item.ocrStatus = 'failed';
    item.extractedText = '';
    item.parseStatus = 'needs_check';
    console.warn('OCR unavailable or failed; original image remains saved.', error);
  }
  await rawRepo.put(item); emit('ocr:done', { rawItemId:item.id, status:item.ocrStatus });
  if (item.extractedText) await parseRawItem(item);
  return item;
}
