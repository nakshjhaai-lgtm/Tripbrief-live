import { tx, request } from './idb.js';
import { nowIso } from '../utils/dates.js';
export function repo(store) {
  return {
    async put(item) { item.updatedAt = nowIso(); if (!item.createdAt) item.createdAt = item.updatedAt; await tx(store, 'readwrite', s => s.put(item)); return item; },
    async add(item) { item.updatedAt = nowIso(); item.createdAt ||= item.updatedAt; await tx(store, 'readwrite', s => s.add(item)); return item; },
    async get(id) { return tx(store, 'readonly', s => request(s.get(id))); },
    async all() { return tx(store, 'readonly', s => request(s.getAll())); },
    async delete(id) { return tx(store, 'readwrite', s => s.delete(id)); },
    async byIndex(index, value) { return tx(store, 'readonly', s => request(s.index(index).getAll(value))); }
  };
}
export const tripsRepo = repo('trips');
export const rawRepo = repo('rawItems');
export const eventsRepo = repo('events');
export const docsRepo = repo('documents');
export const weatherRepo = repo('weatherCache');
export const guideRepo = repo('destinationGuides');
export const currencyRepo = repo('currencyCache');
export const placesRepo = repo('placesCache');
export const offlinePackRepo = repo('offlinePacks');
export const auditRepo = repo('auditLog');
export async function latestByTrip(repository, tripId, dateField='updatedAt') { const rows = await repository.byIndex('tripId', tripId); return rows.sort((a,b)=>String(b[dateField]||'').localeCompare(String(a[dateField]||'')))[0] || null; }
