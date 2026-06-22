export const state = new Proxy({
  online: navigator.onLine,
  route: location.hash ? location.hash.slice(1) : 'home',
  activeTripId: null,
  trips: [],
  activeTrip: null,
  rawItems: [],
  events: [],
  docs: [],
  pack: null,
  processing: { ocr: false, parse: false, enrich: false, offlinePack: false },
  ui: { theme: localStorage.getItem('tb-theme') || 'tripbrief-light', reducedMotion: matchMedia('(prefers-reduced-motion: reduce)').matches, panicMode: false, toast: null, modal: null }
}, {
  set(target, prop, value) {
    target[prop] = value;
    window.dispatchEvent(new CustomEvent('statechange', { detail: { prop, value } }));
    return true;
  }
});
export function setNested(path, value) {
  const keys = path.split('.'); let obj = state;
  while (keys.length > 1) obj = obj[keys.shift()];
  obj[keys[0]] = value;
  window.dispatchEvent(new CustomEvent('statechange', { detail: { prop: path, value } }));
}
