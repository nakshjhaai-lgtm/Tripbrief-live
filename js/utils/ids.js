export function id(prefix = 'id') { return `${prefix}_${Date.now().toString(36)}_${crypto.getRandomValues(new Uint32Array(1))[0].toString(36)}`; }
export async function hashText(text) { const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text)); return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2,'0')).join(''); }
export async function hashBlob(blob) { const buf = await blob.arrayBuffer(); const digest = await crypto.subtle.digest('SHA-256', buf); return [...new Uint8Array(digest)].map(b => b.toString(16).padStart(2,'0')).join(''); }
