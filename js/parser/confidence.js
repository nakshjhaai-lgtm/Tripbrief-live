export const CONFIDENCE = { HIGH: 0.85, MEDIUM: 0.55, LOW: 0.3 };
export function statusFor(score) { if (score >= CONFIDENCE.HIGH) return 'auto'; if (score >= CONFIDENCE.MEDIUM) return 'needs_check'; return 'reference_only'; }
export function scoreNearby(text, value, words=[]) { const ix = text.indexOf(value); if (ix < 0) return .35; const near = text.slice(Math.max(0, ix-90), ix+value.length+90).toLowerCase(); const hits = words.filter(w => near.includes(w.toLowerCase())).length; return Math.min(.95, .35 + hits * .18); }
