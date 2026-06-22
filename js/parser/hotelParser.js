import { scoreNearby, statusFor } from './confidence.js';
export function extractHotels(text) {
  const lower = text.toLowerCase();
  if (!/(hotel|check-?in|reservation|guest|room|property|arrival|departure)/.test(lower)) return [];
  const lines = text.split('\n').map(l=>l.trim()).filter(Boolean);
  const likely = lines.find(l => /hotel|inn|resort|suites|hostel|hoxton|marriott|hilton|hyatt|stay/i.test(l)) || lines[0] || 'Hotel stay';
  const confidence = scoreNearby(lower, likely.toLowerCase(), ['hotel','check-in','reservation','arrival','room','guest']);
  return [{ type:'hotel', title: likely.slice(0,80), confidence: Math.max(.62, confidence), status: statusFor(Math.max(.62, confidence)), reason:'Hotel/stay words found near a likely property line.' }];
}
