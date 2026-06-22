import { statusFor } from './confidence.js';
const MONTH = '(?:jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)[a-z]*';
export function extractDates(text) {
  const patterns = [new RegExp(`\\b\\d{1,2}[\\s-]+${MONTH}[\\s,-]+\\d{2,4}\\b`, 'gi'), /\b\d{4}-\d{2}-\d{2}\b/g, /\b\d{1,2}\/\d{1,2}\/\d{2,4}\b/g];
  const found = [...new Set(patterns.flatMap(re => text.match(re) || []))];
  return found.map(d => ({ type:'note', title:`Date found: ${d}`, start: d, confidence:.58, status:statusFor(.58), reason:'Date-like text found; user should verify locale and year.' }));
}
export function extractTimes(text) { return [...new Set((text.match(/\b(?:[01]?\d|2[0-3]):[0-5]\d\b|\b\d{1,2}(?::\d{2})?\s?(?:am|pm)\b/gi) || []))].map(t => ({ type:'note', title:`Time found: ${t}`, confidence:.45, status:'reference_only', reason:'Time-like text found without enough context.' })); }
