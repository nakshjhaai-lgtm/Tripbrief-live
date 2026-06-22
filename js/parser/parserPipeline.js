import { id } from '../utils/ids.js';
import { normalize, truncate } from '../utils/text.js';
import { nowIso } from '../utils/dates.js';
import { tripsRepo, eventsRepo, rawRepo } from '../db/repositories.js';
import { emit } from '../events.js';
import { extractFlights } from './flightParser.js';
import { extractHotels } from './hotelParser.js';
import { extractDates, extractTimes } from './dateParser.js';
import { extractConfirmationCodes } from './confirmationParser.js';
import { extractAddresses } from './addressParser.js';
import { rebuildOfflinePack } from '../offline/packBuilder.js';
export async function ensureTrip(rawItem, candidates=[]) {
  if (rawItem.tripId) return rawItem.tripId;
  const trips = await tripsRepo.all();
  const active = trips.find(t => t.status === 'active') || trips.sort((a,b)=>String(b.updatedAt).localeCompare(String(a.updatedAt)))[0];
  if (active) return active.id;
  const trip = await tripsRepo.put({ id:id('trip'), title:'New Trip from Travel Dump', destinationLabel:'Not confirmed', status:'active', readinessScore:0, createdAt:nowIso(), updatedAt:nowIso(), lastOpenedAt:nowIso() });
  emit('trip:auto-created', { tripId: trip.id });
  return trip.id;
}
export async function parseRawItem(rawItem) {
  const text = normalize(rawItem.extractedText || rawItem.text || '');
  const tripId = await ensureTrip(rawItem);
  rawItem.tripId = tripId;
  rawItem.parseStatus = 'queued';
  await rawRepo.put(rawItem);
  const candidates = [ ...extractFlights(text), ...extractHotels(text), ...extractDates(text), ...extractTimes(text), ...extractConfirmationCodes(text), ...extractAddresses(text) ];
  for (const c of candidates) await eventsRepo.put({ id:id('evt'), tripId, rawItemId:rawItem.id, type:c.type || 'note', title:c.title || 'Travel item', start:c.start || null, end:c.end || null, locationLabel:c.locationLabel || null, lat:null, lon:null, confirmationCode:c.confirmationCode || null, provider:c.provider || null, confidence:c.confidence || .3, status:c.status || 'needs_check', sourceSnippet:truncate(text, 240), reason:c.reason || 'Parsed from imported text.', createdAt:nowIso(), updatedAt:nowIso() });
  rawItem.parseStatus = candidates.length ? 'done' : 'needs_check';
  await rawRepo.put(rawItem);
  await refineTrip(tripId);
  await rebuildOfflinePack(tripId);
  emit('parser:done', { rawItemId: rawItem.id, count: candidates.length });
  return candidates;
}
async function refineTrip(tripId) {
  const trip = await tripsRepo.get(tripId); if (!trip) return;
  const events = await eventsRepo.byIndex('tripId', tripId);
  const hotel = events.find(e => e.type === 'hotel' && e.status !== 'discarded');
  const dates = events.map(e => e.start).filter(Boolean);
  if (hotel && (!trip.title || /Dump|New Trip/.test(trip.title))) trip.title = `${hotel.title} Trip`;
  if (dates.length && !trip.startDate) trip.startDate = dates[0];
  trip.updatedAt = nowIso();
  await tripsRepo.put(trip);
}
