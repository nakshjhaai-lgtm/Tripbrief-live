import { id } from '../utils/ids.js';
import { nowIso, dateRange, fmtDate } from '../utils/dates.js';
import { redactSensitive } from '../utils/text.js';
import { tripsRepo, eventsRepo, docsRepo, weatherRepo, guideRepo, currencyRepo, placesRepo, offlinePackRepo } from '../db/repositories.js';
import { emit } from '../events.js';
export const readinessChecks = [
  { id:'has_dates', label:'Trip dates added', weight:8 }, { id:'has_stay_address', label:'Stay address saved offline', weight:14 }, { id:'has_transport', label:'Arrival/departure transport saved', weight:12 }, { id:'has_confirmation_codes', label:'Confirmation codes saved', weight:10 }, { id:'has_emergency_contact', label:'Emergency contact added', weight:10 }, { id:'has_insurance', label:'Insurance info added', weight:8 }, { id:'has_documents', label:'Important documents stored', weight:10 }, { id:'has_weather', label:'Weather cached', weight:6 }, { id:'has_currency', label:'Currency cheat sheet cached', weight:5 }, { id:'has_packing', label:'Packing checklist started', weight:7 }, { id:'has_share_pack', label:'Share pack generated', weight:10 }
];
export function calculateReadiness({ trip, events, docs, weather, currency, guide, places }) {
  const has = {
    has_dates: !!(trip?.startDate || events.some(e=>e.start)),
    has_stay_address: events.some(e=>e.locationLabel),
    has_transport: events.some(e=>['flight','train','bus','car'].includes(e.type)),
    has_confirmation_codes: events.some(e=>e.confirmationCode),
    has_emergency_contact: false,
    has_insurance: docs.some(d=>d.type==='insurance'),
    has_documents: docs.length > 0,
    has_weather: !!weather,
    has_currency: !!currency,
    has_packing: !!weather?.packingSuggestions,
    has_share_pack: true
  };
  const score = readinessChecks.reduce((sum, c) => sum + (has[c.id] ? c.weight : 0), 0);
  const missing = readinessChecks.filter(c => !has[c.id]).slice(0,4);
  return { score, has, missing, updatedAt: nowIso() };
}
export async function rebuildOfflinePack(tripId) {
  const [trip, events, docs, weatherRows, currencyRows, guideRows, places] = await Promise.all([
    tripsRepo.get(tripId), eventsRepo.byIndex('tripId', tripId), docsRepo.byIndex('tripId', tripId), weatherRepo.byIndex('tripId', tripId), currencyRepo.byIndex('tripId', tripId), guideRepo.byIndex('tripId', tripId), placesRepo.byIndex('tripId', tripId).catch(()=>[])
  ]);
  if (!trip) return null;
  const weather = weatherRows.sort((a,b)=>String(b.fetchedAt).localeCompare(String(a.fetchedAt)))[0] || null;
  const currency = currencyRows.sort((a,b)=>String(b.fetchedAt).localeCompare(String(a.fetchedAt)))[0] || null;
  const guide = guideRows.sort((a,b)=>String(b.fetchedAt).localeCompare(String(a.fetchedAt)))[0] || null;
  const readiness = calculateReadiness({ trip, events, docs, weather, currency, guide, places });
  trip.readinessScore = readiness.score; await tripsRepo.put(trip);
  const accepted = events.filter(e => e.status !== 'discarded').sort((a,b)=>String(a.start||'9999').localeCompare(String(b.start||'9999')));
  const nextEvent = accepted.find(e => !e.start || new Date(e.start) >= new Date()) || accepted[0] || null;
  const pack = {
    id:id('pack'), tripId, generatedAt:nowIso(), version:1,
    summary:{ tripTitle:trip.title, dateRange:dateRange(trip), destination:trip.destinationLabel || 'Not confirmed', readinessScore:readiness.score, status: readiness.score > 70 ? 'Ready' : readiness.score > 35 ? 'Partial' : 'Missing Critical Info' },
    critical:{ nextEvent, stayAddress: accepted.find(e=>e.locationLabel)?.locationLabel || null, confirmationCodes: accepted.filter(e=>e.confirmationCode).map(e=>({title:e.title, code:e.confirmationCode})), emergencyContacts: [], insurance: docs.find(d=>d.type==='insurance') || null, documentRefs: docs.map(d=>({id:d.id,title:d.title,type:d.type,sensitive:d.sensitive})), rawProofRefs: [...new Set(accepted.map(e=>e.rawItemId).filter(Boolean))] },
    cached:{ weatherSummary: weather?.summary || null, currencyCheatSheet: currency?.cheatSheet || null, destinationMiniGuide: guide?.summary || null, essentialPlaces: places || [], phraseCards: buildPhraseCards(trip), packingCritical: weather?.packingSuggestions || [] },
    exports:{ plainText:'', markdown:'', printableHtml:'', ics:'' },
    readinessSnapshot: readiness, status: readiness.score > 70 ? 'ready' : readiness.score > 35 ? 'partial' : 'partial'
  };
  pack.exports.plainText = exportPlainText(pack);
  pack.exports.markdown = exportMarkdown(pack);
  pack.exports.printableHtml = exportHtml(pack);
  pack.exports.ics = exportIcs(pack, accepted);
  await offlinePackRepo.put(pack);
  emit('pack:ready', { tripId, packId: pack.id });
  return pack;
}
function buildPhraseCards(trip) { return [`Please take me to ${trip.destinationLabel || 'my hotel address shown here'}.`, 'I do not have internet. Please use the saved address.', 'Can you help me call this emergency contact?']; }
export function exportPlainText(pack) { return redactSensitive(`TRIPBRIEF LIVE — LIFEBOAT PACK\n${pack.summary.tripTitle}\n${pack.summary.dateRange}\nReadiness: ${pack.summary.readinessScore}%\n\nNEXT\n${pack.critical.nextEvent?.title || 'No next event confirmed'}\n${pack.critical.nextEvent?.locationLabel || ''}\n\nCODES\n${pack.critical.confirmationCodes.map(c=>`${c.title}: ${c.code}`).join('\n') || 'No confirmation codes saved'}\n\nWEATHER\n${pack.cached.weatherSummary || 'Weather not cached yet'}\n\nCURRENCY\n${pack.cached.currencyCheatSheet || 'Currency not cached yet'}`); }
export function exportMarkdown(pack) { return `# ${pack.summary.tripTitle}\n\n**${pack.summary.dateRange}** · **${pack.summary.readinessScore}% ready**\n\n## Next\n${pack.critical.nextEvent?.title || 'No next event confirmed'}\n\n## Offline essentials\n- Weather: ${pack.cached.weatherSummary || 'Not cached'}\n- Currency: ${pack.cached.currencyCheatSheet || 'Not cached'}\n- Destination: ${pack.cached.destinationMiniGuide || 'Not cached'}\n`; }
export function exportHtml(pack) { return `<!doctype html><meta charset="utf-8"><title>${pack.summary.tripTitle}</title><style>body{font-family:Georgia,serif;padding:32px;line-height:1.45}h1{font-size:44px}.box{border:2px solid #111;padding:16px;margin:16px 0;border-radius:12px}</style><h1>${pack.summary.tripTitle}</h1><p>${pack.summary.dateRange} · ${pack.summary.readinessScore}% ready</p><div class="box"><h2>Next</h2><p>${pack.critical.nextEvent?.title || 'No next event confirmed'}</p></div><div class="box"><h2>Offline cached</h2><p>${pack.cached.weatherSummary || 'Weather not cached yet'}</p><p>${pack.cached.currencyCheatSheet || 'Currency not cached yet'}</p></div>`; }
export function exportIcs(pack, events) { const lines = ['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//TripBrief Live//Offline Pack//EN']; for (const e of events.filter(x=>x.start)) lines.push('BEGIN:VEVENT',`UID:${e.id}@tripbrief.live`,`DTSTAMP:${new Date().toISOString().replace(/[-:]/g,'').split('.')[0]}Z`,`SUMMARY:${String(e.title).replace(/\n/g,' ')}`,'END:VEVENT'); lines.push('END:VCALENDAR'); return lines.join('\r\n'); }
