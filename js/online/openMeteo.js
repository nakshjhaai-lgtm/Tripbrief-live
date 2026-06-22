import { weatherRepo } from '../db/repositories.js';
import { id } from '../utils/ids.js';
import { nowIso } from '../utils/dates.js';
export async function fetchWeather({ tripId, lat, lon, startDate, endDate }) {
  const params = new URLSearchParams({ latitude: lat, longitude: lon, daily: ['temperature_2m_max','temperature_2m_min','precipitation_probability_max','uv_index_max','wind_speed_10m_max'].join(','), timezone:'auto' });
  const res = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`);
  if (!res.ok) throw new Error('Weather fetch failed');
  const payload = await res.json();
  const d = payload.daily || {}; const max = d.temperature_2m_max?.[0]; const min = d.temperature_2m_min?.[0]; const rain = d.precipitation_probability_max?.[0];
  const summary = [max!=null&&min!=null ? `${Math.round(min)}–${Math.round(max)}°C` : 'Weather values cached', rain!=null ? `${rain}% precipitation chance` : null].filter(Boolean).join(' · ');
  const packingSuggestions = [rain > 35 ? 'Pack compact rain layer' : null, max > 28 ? 'Pack sun protection' : null, min < 12 ? 'Pack warm layer' : null].filter(Boolean);
  const row = { id:id('weather'), tripId, lat, lon, startDate, endDate, payload, summary, packingSuggestions, fetchedAt:nowIso(), expiresAt:new Date(Date.now()+86400000).toISOString() };
  await weatherRepo.put(row); return row;
}
