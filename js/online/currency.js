import { currencyRepo } from '../db/repositories.js';
import { id } from '../utils/ids.js';
import { nowIso } from '../utils/dates.js';
export async function fetchCurrency({ tripId, base='EUR', target='USD' }) {
  const res = await fetch(`https://api.frankfurter.app/latest?from=${encodeURIComponent(base)}&to=${encodeURIComponent(target)}`); if (!res.ok) throw new Error('Currency fetch failed');
  const data = await res.json(); const rate = data.rates?.[target]; if (!rate) throw new Error('Currency rate missing');
  const cheatSheet = [1,5,10,20,50,100].map(n => `${base} ${n} ≈ ${target} ${Math.round(n*rate*100)/100}`).join('\n');
  const row = { id:id('currency'), tripId, base, target, rate, cheatSheet, fetchedAt:nowIso() }; await currencyRepo.put(row); return row;
}
