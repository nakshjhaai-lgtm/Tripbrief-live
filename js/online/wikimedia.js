import { guideRepo } from '../db/repositories.js';
import { id } from '../utils/ids.js';
import { nowIso } from '../utils/dates.js';
export async function fetchDestinationGuide({ tripId, destination }) {
  const search = new URLSearchParams({ origin:'*', action:'query', list:'search', srsearch:destination, format:'json' });
  const res = await fetch(`https://en.wikipedia.org/w/api.php?${search}`); if (!res.ok) throw new Error('Destination search failed');
  const data = await res.json(); const first = data.query?.search?.[0]; if (!first) throw new Error('No guide result found');
  const summary = String(first.snippet || '').replace(/<[^>]*>/g,'').slice(0,500);
  const row = { id:id('guide'), tripId, destinationLabel:destination, source:'wikimedia', title:first.title, summary, url:`https://en.wikipedia.org/wiki/${encodeURIComponent(first.title.replace(/ /g,'_'))}`, fetchedAt:nowIso() };
  await guideRepo.put(row); return row;
}
