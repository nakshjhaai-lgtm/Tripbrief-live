import { scoreNearby, statusFor } from './confidence.js';
export function extractFlights(text) {
  const matches = [...new Set((text.match(/\b[A-Z]{2}\s?\d{2,4}\b/g) || []))];
  return matches.map(code => { const confidence = scoreNearby(text, code, ['flight','depart','arrival','boarding','airline','terminal','airport']); return { type:'flight', title:`Flight ${code.replace(/\s+/,'')}`, confirmationCode: code.replace(/\s+/,''), confidence, status: statusFor(confidence), reason:'Matched airline-style flight code. No live gate or delay inferred.' }; });
}
