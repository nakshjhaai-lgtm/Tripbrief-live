export const nowIso = () => new Date().toISOString();
export function fmtDate(value) { if (!value) return 'Date not confirmed'; try { return new Intl.DateTimeFormat(undefined,{dateStyle:'medium', timeStyle: value.includes('T') ? 'short' : undefined}).format(new Date(value)); } catch { return value; } }
export function dateRange(trip) { if (!trip?.startDate && !trip?.endDate) return 'Dates not confirmed'; return [trip.startDate, trip.endDate].filter(Boolean).map(d => fmtDate(d).replace(/, \d{1,2}:.*$/,'')).join(' – '); }
