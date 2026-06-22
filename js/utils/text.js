export function escapeHtml(s='') { return String(s).replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c])); }
export function normalize(s='') { return String(s).replace(/\r/g,'\n').replace(/[ \t]+/g,' ').replace(/\n{3,}/g,'\n\n').trim(); }
export function truncate(s='', n=220) { return s.length > n ? `${s.slice(0,n-1)}…` : s; }
export function redactSensitive(s='') { return String(s).replace(/\b([A-Z0-9]{2})([A-Z0-9]{4,10})([A-Z0-9]{2})\b/g, '$1••••$3').replace(/\b\d{8,}\b/g, m => `${m.slice(0,2)}••••${m.slice(-2)}`); }
